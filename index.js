const dropArea = document.getElementById('drop-area');
const bookEmojis = ['📕', '📙', '📒', '📗', '📘', '📓', '📔'];

function download(element, filename, contents) {
  element.setAttribute('href', 'data:text/markdown;charset=utf-8,' + encodeURIComponent(contents));
  element.setAttribute('download', filename);
  element.classList.add("book-url")

}

dropArea.addEventListener('dragover', (event) => {
  event.stopPropagation();
  event.preventDefault();
  // Style the drag-and-drop as a "copy file" operation.
  event.dataTransfer.dropEffect = 'copy';
});

dropArea.addEventListener('drop', (event) => {
  event.stopPropagation();
  event.preventDefault();
  const fileList = event.dataTransfer.files;
  if (!validateType(fileList)) return null;

  readFile(fileList[0]);
});

function validateType(fileList) {
  for (const file of fileList) {
    const type = file.type
    if (type != 'text/plain') {
      alert("Only .txt files are supported");
      return false;
    } else {
      return true;
    }
  }
};

function readFile(file) {
  const reader = new FileReader();
  const separator = '==========';
  const timestampRegex = /Added on|Добавлено|Añadido el\:*/;

  reader.onload = function(event) {
    var contents = event.target.result;
    const notes = contents.split(separator);

    const parsed = notes.map(note => {
      var attributes = note.split("\n");
      var cleanedUpAttributes = attributes.filter(attr => attr !== "\r" && attr !== '');

      if (cleanedUpAttributes.length < 3) return null;

      var title = cleanedUpAttributes[0].replace(/[\n\r]+/g, '').replace(/^\uFEFF/gm, '').replace(/^\u00BB\u00BF/gm,'');
      var text = cleanedUpAttributes[2].replace(/[\n\r]+/g, '');
      var timestamp = cleanedUpAttributes[1].replace(/[\n\r]+/g, '').split(timestampRegex).filter(Boolean)[1];

      return {title: title, text: text, timestamp: timestamp};
    }).filter(value => value);

    const groupByTitles = groupBy('title');
    const grouped = groupByTitles(parsed);

    booksTitles = Object.keys(grouped);

    document.getElementById('separator').innerHTML = '. . .';
    document.getElementById('status').innerHTML = '✨ Success! Found some notes:';

    let bookIndex = 0;
    for (const title in grouped) {
      amountOfNotes = grouped[title].length;

      renderBook(grouped, title, amountOfNotes, bookIndex);

      (bookIndex >= bookEmojis.length - 1) ? bookIndex = 0 : bookIndex++;
    }

    // TODO: Handle errors
    // TODO: Handle other languages? Check how Kindle behaves when other system languages are used
    // TODO: Generate CSV and/or Markdown
  };

  reader.readAsText(file);
}

function renderBook (books, title, amountOfNotes, bookIndex) {
  // create a new div element
  var newDiv = document.createElement("div");
  var anchor = document.createElement("a");
  anchor.id = `book-${bookIndex}`
  // and give it some content
  var paragraph = document.createElement("p");
  var newContent = document.createTextNode(`${bookEmojis[bookIndex]} ${title}: ${amountOfNotes}`);
  // add the text node to the newly created div
  paragraph.appendChild(newContent);
  anchor.appendChild(paragraph);
  newDiv.appendChild(anchor);
  newDiv.classList.add("book");
  // add the newly created element and its content into the DOM
  var booksList = document.getElementById("books-list");
  var firstChild = booksList.firstChild;

  var contents = generateMarkdown(title, books);
  download(anchor, `${title}.md`, contents);
  booksList.insertBefore(newDiv, firstChild);
}

function generateMarkdown(title, books) {
  currentBook = books[title];
  var str = ''
  for (note of currentBook) {
    str += `> ${note['text']}\n\n${note['timestamp']}\n\n`;
  }
  return str;
}

const groupBy = key => array =>
  array.reduce((objectsByKeyValue, obj) => {
    const value = obj[key];
    objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
    return objectsByKeyValue;
  }, {});
