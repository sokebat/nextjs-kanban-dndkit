"use client"

import type React from "react"
import { useState, memo } from "react"
import { Plus, X } from "lucide-react"

interface AddColumnFormProps {
  onAddColumn: (title: string) => boolean
}

export const AddColumnForm = memo(function AddColumnForm({ onAddColumn }: AddColumnFormProps) {
  const [title, setTitle] = useState("")
  const [isFormVisible, setIsFormVisible] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (title.trim() === "") {
      setError("Column title cannot be empty")
      return
    }

    const success = onAddColumn(title)
    if (success) {
      setTitle("")
      setIsFormVisible(false)
    }
  }

  return (
    <div className="mb-4 w-full">
      {isFormVisible ? (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-2 items-start sm:items-center w-full bg-zinc-100 p-4 rounded-lg shadow-sm border border-zinc-200"
        >
          <div className="w-full sm:w-auto flex-1">
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                setError("")
              }}
              placeholder="Enter column title"
              className={`flex-1 p-2 border ${error ? "border-red-500" : "border-zinc-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 w-full bg-white`}
              autoFocus
              aria-label="New column title"
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              type="submit"
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors flex-1 sm:flex-none"
              aria-label="Add column"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setIsFormVisible(false)
                setError("")
                setTitle("")
              }}
              className="text-zinc-500 hover:text-zinc-700 transition-colors p-2 hover:bg-zinc-200 rounded-md"
              aria-label="Cancel"
            >
              <X size={20} />
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setIsFormVisible(true)}
          className="flex items-center justify-center sm:justify-start gap-2 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors w-full sm:w-auto shadow-sm"
          aria-label="Add new column"
        >
          <Plus size={18} />
          Add Column
        </button>
      )}
    </div>
  )
})

