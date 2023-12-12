async function main() {
  let submitBtn = document.getElementById("submitBtn");
  submitBtn.disabled = true;
  submitBtn.innerHTML = "Loading dependencies...";

  statuShowOutput(false);

  let pyodide = await loadPyodide();
  await pyodide.loadPackage("micropip");
  const micropip = pyodide.pyimport("micropip");
  // pdfplumber
  pyodide.loadPackage(
    "https://files.pythonhosted.org/packages/6e/4c/5abaf9668b22628cdd899ef863a2c3e62bba316402e3313ab661608ae44e/pdfplumber-0.8.0-py3-none-any.whl"
  );
  await micropip.install("pdfminer.six");

  pyodide.globals.set("buildCarrousel", buildCarrousel);
  window.pyodide = pyodide;

  submitBtn.disabled = false;
  submitBtn.innerHTML = "Magic!";
}
main();

function statuShowOutput(show) {
  let output = document.getElementById("output");
  output.style.display = show ? "block" : "none";
}

function plumb() {
  let fileInput = document.querySelector("input#filePDF");
  let file = fileInput.files[0];

  if (file && file.type === "application/pdf") {
    let reader = new FileReader();
    reader.onload = async function (e) {
      let contents = e.target.result.split(",")[1];
      // Fetch the Python code from the file
      let pythonCodeResponse = await fetch("python.txt");
      let pythonCode = await pythonCodeResponse.text();
      pythonCode = pythonCode.replace("${contents}", contents);
      pythonCode = pythonCode.replace("${file.name}", file.name);
      window.pyodide.runPythonAsync(pythonCode);
    };

    reader.readAsDataURL(file);
  } else {
    alert("A PDF has not been uploaded.");
  }
}

function buildCarrousel(pages) {
  const carousel = document.getElementById("carousel");
  carousel.innerHTML = "";
  pages.forEach((text, index) => {
    const pageElement = document.createElement("div");
    pageElement.className = "page";
    pageElement.innerHTML = `<h2>Page ${index + 1}</h2><p>${text}</p>`;
    carousel.appendChild(pageElement);
  });

  carousel.scrollLeft = 0;
}

function scrollCarousel(direction) {
  const carousel = document.getElementById("carousel");
  carousel.scrollBy({
    left: direction * (carousel.clientWidth - 20),
    behavior: "smooth",
  });
}
