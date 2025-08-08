export interface Bookmark {
  id: string
  type: 'bookmark'
  name: string
  url: string
  dateAdded?: number
}

export interface BookmarkFolder {
  id: string
  type: 'folder'
  name: string
  children: (Bookmark | BookmarkFolder)[]
  dateAdded?: number
}

export function parseBookmarksHTML(html: string): BookmarkFolder {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  
  let idCounter = 0
  const generateId = () => `item-${idCounter++}`

  function parseElement(element: Element): Bookmark | BookmarkFolder | null {
    if (element.tagName === 'A') {
      const href = element.getAttribute('href')
      const name = element.textContent?.trim()
      const addDate = element.getAttribute('add_date')
      
      if (!href || !name) return null
      
      return {
        id: generateId(),
        type: 'bookmark',
        name,
        url: href,
        dateAdded: addDate ? parseInt(addDate) * 1000 : undefined
      }
    }
    
    if (element.tagName === 'H3') {
      const name = element.textContent?.trim()
      const addDate = element.getAttribute('add_date')
      
      if (!name) return null
      
      const folder: BookmarkFolder = {
        id: generateId(),
        type: 'folder',
        name,
        children: [],
        dateAdded: addDate ? parseInt(addDate) * 1000 : undefined
      }
      
      // Find the next DL element which contains the folder's contents
      let nextElement = element.nextElementSibling
      while (nextElement && nextElement.tagName !== 'DL') {
        nextElement = nextElement.nextElementSibling
      }
      
      if (nextElement && nextElement.tagName === 'DL') {
        // Parse children in the exact order they appear in the HTML
        const children = Array.from(nextElement.children)
        for (const child of children) {
          if (child.tagName === 'DT') {
            const firstChild = child.firstElementChild
            if (firstChild) {
              const parsed = parseElement(firstChild)
              if (parsed) {
                folder.children.push(parsed)
              }
            }
          }
        }
      }
      
      return folder
    }
    
    return null
  }

  // Find the main bookmarks structure
  const dlElements = doc.querySelectorAll('dl')
  const mainDl = dlElements[0] // Usually the first DL contains the main structure
  
  if (!mainDl) {
    throw new Error('No bookmark structure found in the HTML file')
  }

  const rootFolder: BookmarkFolder = {
    id: generateId(),
    type: 'folder',
    name: 'Bookmarks', // This is the conceptual root, not necessarily "Bookmarks Bar"
    children: []
  }

  // Parse all DT elements in the main DL in their original order
  const dtElements = Array.from(mainDl.children).filter(child => child.tagName === 'DT')
  
  for (const dt of dtElements) {
    const firstChild = dt.firstElementChild
    if (firstChild) {
      const parsed = parseElement(firstChild)
      // If it's the "Bookmarks Bar" folder, flatten its children into the root
      // Otherwise, add the parsed item normally
      if (parsed && parsed.type === 'folder' && parsed.name === 'Bookmarks Bar') {
        rootFolder.children.push(...parsed.children)
      } else if (parsed) {
        rootFolder.children.push(parsed)
      }
    }
  }

  return rootFolder
}
