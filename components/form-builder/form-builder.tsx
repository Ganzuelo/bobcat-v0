"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { TouchBackend } from "react-dnd-touch-backend"
import update from "immutability-helper"
import { v4 as uuidv4 } from "uuid"

import Section from "./section"
import AddSectionButton from "./add-section-button"
import PageSettings from "./page-settings"
import QuestionPalette from "./question-palette"

import { QuestionType } from "./types"

const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0

const FormBuilder: React.FC = () => {
  const [pages, setPages] = useState([
    {
      id: uuidv4(),
      title: "Page 1",
      description: "Description for Page 1",
      sections: [
        {
          id: uuidv4(),
          title: "Section 1",
          questions: [
            { id: uuidv4(), text: "Question 1", type: QuestionType.TEXT },
            { id: uuidv4(), text: "Question 2", type: QuestionType.NUMBER },
          ],
        },
      ],
    },
  ])
  const [selectedPageId, setSelectedPageId] = useState(pages[0].id)
  const [isPaletteOpen, setIsPaletteOpen] = useState(false)

  const backend = isTouchDevice ? TouchBackend : HTML5Backend

  const moveQuestion = useCallback(
    (dragIndex: number, hoverIndex: number, sourceSectionId: string, targetSectionId: string, pageId: string) => {
      setPages((prevPages) => {
        const pageIndex = prevPages.findIndex((p) => p.id === pageId)
        if (pageIndex === -1) return prevPages

        const page = prevPages[pageIndex]
        const sourceSectionIndex = page.sections.findIndex((section) => section.id === sourceSectionId)
        const targetSectionIndex = page.sections.findIndex((section) => section.id === targetSectionId)

        if (sourceSectionIndex === -1 || targetSectionIndex === -1) return prevPages

        const sourceSection = page.sections[sourceSectionIndex]
        const targetSection = page.sections[targetSectionIndex]

        const question = sourceSection.questions[dragIndex]

        // If moving within the same section
        if (sourceSectionId === targetSectionId) {
          const updatedSections = update(page.sections, {
            [sourceSectionIndex]: {
              questions: {
                $splice: [
                  [dragIndex, 1],
                  [hoverIndex, 0, question],
                ],
              },
            },
          })

          return update(prevPages, {
            [pageIndex]: {
              sections: { $set: updatedSections },
            },
          })
        } else {
          // Moving to a different section
          const updatedSourceSections = update(page.sections, {
            [sourceSectionIndex]: {
              questions: { $splice: [[dragIndex, 1]] },
            },
          })

          const updatedTargetSections = update(page.sections, {
            [targetSectionIndex]: {
              questions: { $splice: [[hoverIndex, 0, question]] },
            },
          })

          return update(prevPages, {
            [pageIndex]: {
              sections: {
                $set: [
                  ...updatedSourceSections.slice(0, sourceSectionIndex),
                  updatedSourceSections[sourceSectionIndex],
                  ...updatedTargetSections.slice(0, targetSectionIndex),
                  updatedTargetSections[targetSectionIndex],
                  ...updatedSourceSections.slice(sourceSectionIndex + 1, updatedSourceSections.length),
                ],
              },
            },
          })
        }
      })
    },
    [setPages],
  )

  const moveSection = useCallback(
    (dragIndex: number, hoverIndex: number, pageId: string) => {
      setPages((prevPages) => {
        const pageIndex = prevPages.findIndex((p) => p.id === pageId)
        if (pageIndex === -1) return prevPages

        const page = prevPages[pageIndex]
        const updatedSections = update(page.sections, {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, page.sections[dragIndex]],
          ],
        })

        return update(prevPages, {
          [pageIndex]: {
            sections: { $set: updatedSections },
          },
        })
      })
    },
    [setPages],
  )

  const addQuestion = useCallback(
    (sectionId: string, type: QuestionType, pageId: string) => {
      setPages((prevPages) => {
        const pageIndex = prevPages.findIndex((p) => p.id === pageId)
        if (pageIndex === -1) return prevPages

        const page = prevPages[pageIndex]
        const sectionIndex = page.sections.findIndex((section) => section.id === sectionId)
        if (sectionIndex === -1) return prevPages

        const updatedSections = update(page.sections, {
          [sectionIndex]: {
            questions: { $push: [{ id: uuidv4(), text: "New Question", type: type }] },
          },
        })

        return update(prevPages, {
          [pageIndex]: {
            sections: { $set: updatedSections },
          },
        })
      })
    },
    [setPages],
  )

  const addSection = useCallback(
    (pageId: string) => {
      setPages((prevPages) => {
        const pageIndex = prevPages.findIndex((p) => p.id === pageId)
        if (pageIndex === -1) return prevPages

        const updatedPages = update(prevPages, {
          [pageIndex]: {
            sections: { $push: [{ id: uuidv4(), title: "New Section", questions: [] }] },
          },
        })
        return updatedPages
      })
    },
    [setPages],
  )

  const updateQuestionText = useCallback(
    (questionId: string, newText: string, sectionId: string, pageId: string) => {
      setPages((prevPages) => {
        const pageIndex = prevPages.findIndex((p) => p.id === pageId)
        if (pageIndex === -1) return prevPages

        const page = prevPages[pageIndex]
        const sectionIndex = page.sections.findIndex((section) => section.id === sectionId)
        if (sectionIndex === -1) return prevPages

        const questionIndex = page.sections[sectionIndex].questions.findIndex((question) => question.id === questionId)
        if (questionIndex === -1) return prevPages

        const updatedPages = update(prevPages, {
          [pageIndex]: {
            sections: {
              [sectionIndex]: {
                questions: {
                  [questionIndex]: { text: { $set: newText } },
                },
              },
            },
          },
        })
        return updatedPages
      })
    },
    [setPages],
  )

  const updateSectionTitle = useCallback(
    (sectionId: string, newTitle: string, pageId: string) => {
      setPages((prevPages) => {
        const pageIndex = prevPages.findIndex((p) => p.id === pageId)
        if (pageIndex === -1) return prevPages

        const page = prevPages[pageIndex]
        const sectionIndex = page.sections.findIndex((section) => section.id === sectionId)
        if (sectionIndex === -1) return prevPages

        const updatedPages = update(prevPages, {
          [pageIndex]: {
            sections: {
              [sectionIndex]: { title: { $set: newTitle } },
            },
          },
        })
        return updatedPages
      })
    },
    [setPages],
  )

  const updatePageTitle = useCallback(
    (pageId: string, newTitle: string) => {
      setPages((prevPages) => {
        const pageIndex = prevPages.findIndex((p) => p.id === pageId)
        if (pageIndex === -1) return prevPages

        const updatedPages = update(prevPages, {
          [pageIndex]: { title: { $set: newTitle } },
        })
        return updatedPages
      })
    },
    [setPages],
  )

  const updatePageDescription = useCallback(
    (pageId: string, newDescription: string) => {
      setPages((prevPages) => {
        const pageIndex = prevPages.findIndex((p) => p.id === pageId)
        if (pageIndex === -1) return prevPages

        const updatedPages = update(prevPages, {
          [pageIndex]: { description: { $set: newDescription } },
        })
        return updatedPages
      })
    },
    [setPages],
  )

  const deleteQuestion = useCallback(
    (questionId: string, sectionId: string, pageId: string) => {
      setPages((prevPages) => {
        const pageIndex = prevPages.findIndex((p) => p.id === pageId)
        if (pageIndex === -1) return prevPages

        const page = prevPages[pageIndex]
        const sectionIndex = page.sections.findIndex((section) => section.id === sectionId)
        if (sectionIndex === -1) return prevPages

        const questionIndex = page.sections[sectionIndex].questions.findIndex((question) => question.id === questionId)
        if (questionIndex === -1) return prevPages

        const updatedSections = update(page.sections, {
          [sectionIndex]: {
            questions: { $splice: [[questionIndex, 1]] },
          },
        })

        return update(prevPages, {
          [pageIndex]: {
            sections: { $set: updatedSections },
          },
        })
      })
    },
    [setPages],
  )

  const deleteSection = useCallback(
    (sectionId: string, pageId: string) => {
      setPages((prevPages) => {
        const pageIndex = prevPages.findIndex((p) => p.id === pageId)
        if (pageIndex === -1) return prevPages

        const sectionIndex = prevPages[pageIndex].sections.findIndex((section) => section.id === sectionId)
        if (sectionIndex === -1) return prevPages

        const updatedPages = update(prevPages, {
          [pageIndex]: {
            sections: { $splice: [[sectionIndex, 1]] },
          },
        })
        return updatedPages
      })
    },
    [setPages],
  )

  const addPage = useCallback(() => {
    setPages((prevPages) => [
      ...prevPages,
      {
        id: uuidv4(),
        title: "New Page",
        description: "",
        sections: [],
      },
    ])
  }, [setPages])

  const deletePage = useCallback(
    (pageId: string) => {
      setPages((prevPages) => prevPages.filter((page) => page.id !== pageId))
    },
    [setPages],
  )

  const selectedPage = pages.find((page) => page.id === selectedPageId)

  if (!selectedPage) {
    return <div>No page selected.</div>
  }

  return (
    <DndProvider backend={backend}>
      <div style={{ display: "flex", height: "100vh" }}>
        {/* Form Builder Area */}
        <div style={{ flex: 3, padding: "20px", overflowY: "auto" }}>
          <h1>Form Builder</h1>

          {/* Page Settings */}
          <PageSettings
            page={selectedPage}
            onTitleChange={(newTitle) => updatePageTitle(selectedPageId, newTitle)}
            onDescriptionChange={(newDescription) => updatePageDescription(selectedPageId, newDescription)}
          />

          {selectedPage.sections.map((section, index) => (
            <Section
              key={section.id}
              index={index}
              id={section.id}
              title={section.title}
              questions={section.questions}
              moveQuestion={moveQuestion}
              moveSection={moveSection}
              addQuestion={addQuestion}
              updateQuestionText={updateQuestionText}
              updateSectionTitle={updateSectionTitle}
              deleteQuestion={deleteQuestion}
              deleteSection={deleteSection}
              pageId={selectedPageId}
            />
          ))}

          <AddSectionButton pageId={selectedPageId} onAddSection={addSection} />
        </div>

        {/* Sidebar */}
        <div style={{ flex: 1, padding: "20px", backgroundColor: "#f0f0f0", overflowY: "auto" }}>
          <h2>Sidebar</h2>
          <div>
            <button onClick={() => setIsPaletteOpen(!isPaletteOpen)}>
              {isPaletteOpen ? "Close Question Palette" : "Open Question Palette"}
            </button>
          </div>

          {/* Question Palette */}
          {isPaletteOpen && <QuestionPalette addQuestion={addQuestion} selectedPageId={selectedPageId} />}

          {/* Page Management */}
          <div>
            <h3>Pages</h3>
            <ul>
              {pages.map((page) => (
                <li key={page.id}>
                  <button onClick={() => setSelectedPageId(page.id)}>{page.title}</button>
                  <button onClick={() => deletePage(page.id)}>Delete Page</button>
                </li>
              ))}
            </ul>
            <button onClick={addPage}>Add New Page</button>
          </div>
        </div>
      </div>
    </DndProvider>
  )
}

export default FormBuilder
