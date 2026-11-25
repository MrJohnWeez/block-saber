const dropZone = document.getElementById('drop-zone');
const fileList = document.getElementById('file-list');

/** Arms the visual highlight while dragged files hover over the drop zone. */
function handleDragOver(event: DragEvent): void {
  event.preventDefault();
  dropZone?.classList.add('is-armed');
}

/** Clears the highlight once dragged files leave the drop zone. */
function handleDragLeave(): void {
  dropZone?.classList.remove('is-armed');
}

/** Appends the name of every dropped file to the on-page list. */
function handleDrop(event: DragEvent): void {
  event.preventDefault();
  dropZone?.classList.remove('is-armed');

  const files = event.dataTransfer ? [...event.dataTransfer.files] : [];
  for (const file of files) {
    const item = document.createElement('li');
    item.textContent = file.name;
    fileList?.appendChild(item);
  }
}

if (dropZone && fileList) {
  dropZone.addEventListener('dragover', handleDragOver);
  dropZone.addEventListener('dragleave', handleDragLeave);
  dropZone.addEventListener('drop', handleDrop);
} else {
  console.error('Block Saber: the drop zone markup is missing from the page.');
}
