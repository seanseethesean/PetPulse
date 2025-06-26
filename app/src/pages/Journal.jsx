import { useEffect, useState } from "react";
import "../assets/Journal.css";
import { getAuth } from "firebase/auth";
import JournalService from "../utils/journal";
import Navbar from "../components/Navbar";

const PetJournal = () => {
  const [selectedPet, setSelectedPet] = useState("")
  const [petList, setPetList] = useState([])
  const [journalEntries, setJournalEntries] = useState([])
  const [newEntry, setNewEntry] = useState({
    title: "",
    content: "",
    mood: "happy",
    activities: [],
    date: new Date().toISOString().split("T")[0]
  })
  const [showAddEntry, setShowAddEntry] = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)
  const [filterDate, setFilterDate] = useState("")
  const [filterMood, setFilterMood] = useState("")

  const activityOptions = [
    "Walk",
    "Play",
    "Eat",
    "Sleep",
    "Vet Visit",
    "Grooming",
    "Training",
    "Bath",
    "Medication",
    "Playtime",
    "Other"
  ]

  const moodOptions = [
    { value: "happy", emoji: "😊", label: "Happy" },
    { value: "playful", emoji: "🐕", label: "Playful" },
    { value: "sleepy", emoji: "😴", label: "Sleepy" },
    { value: "sick", emoji: "🤒", label: "Sick" },
    { value: "anxious", emoji: "😰", label: "Anxious" },
    { value: "excited", emoji: "🤩", label: "Excited" }
  ]

  useEffect(() => {
    fetchPets()
    // Get selected pet from localStorage if available
    const savedPet = localStorage.getItem("selectedPetId")
    if (savedPet) {
      setSelectedPet(savedPet)
    }
  }, [])

  useEffect(() => {
    if (selectedPet) {
      fetchJournalEntries()
    }
  }, [selectedPet])

  const fetchPets = async () => {
    const auth = getAuth()
    const user = auth.currentUser
    if (!user) return

    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/pets?userId=${user.uid}`
      )
      const data = await res.json()
      if (data.success) {
        setPetList(data.pets)
      }
    } catch (err) {
      console.error("Error fetching pets:", err)
    }
  }

  const fetchJournalEntries = async () => {
    const auth = getAuth()
    const user = auth.currentUser
    if (!user || !selectedPet) return

    try {
      const data = await JournalService.getEntries(user.uid, selectedPet)
      if (data.success) {
        setJournalEntries(data.entries || [])
      }
    } catch (err) {
      console.error("Error fetching journal entries:", err)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewEntry((prev) => ({ ...prev, [name]: value }))
  }

  const handleActivityChange = (activity) => {
    setNewEntry((prev) => ({
      ...prev,
      activities: prev.activities.includes(activity)
        ? prev.activities.filter((a) => a !== activity)
        : [...prev.activities, activity]
    }))
  }

  const handleSubmitEntry = async () => {
    if (!newEntry.title.trim() || !newEntry.content.trim()) {
      alert("Please fill in title and mood")
      return
    }

    const auth = getAuth()
    const user = auth.currentUser

    const entryData = {
      ...newEntry,
      petName: selectedPet,
      userId: user.uid,
      createdAt: new Date().toISOString()
    }
    
    try {
      const result = editingEntry
      ? await JournalService.updateEntry(editingEntry.id, entryData)
      : await JournalService.createEntry(entryData)

      if (result.success) {
        alert(editingEntry ? "Entry updated!" : "Entry added!")
        setNewEntry({
          title: "",
          content: "",
          mood: "happy",
          activities: [],
          date: new Date().toISOString().split("T")[0]
        })
        setShowAddEntry(false)
        setEditingEntry(null)
        fetchJournalEntries()
      } else {
        console.error("Failed to save entry: unknown error", result.error)
      }
    } catch (err) {
      console.error("Error saving entry:", err)
    }
  }

  const handleEditEntry = (entry) => {
    setNewEntry({
      title: entry.title,
      content: entry.content,
      mood: entry.mood,
      activities: entry.activities || [],
      date: entry.date
    })
    setEditingEntry(entry)
    setShowAddEntry(true)
  }

  const handleDeleteEntry = async (entryId) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return

    try {
      const result = await JournalService.deleteEntry(entryId)
      if (result.success) {
        alert("Entry deleted!")
        fetchJournalEntries()
      } else {
        console.error("Failed to delete entry:", result.error)
      }
    } catch (err) {
      console.error("Error deleting entry:", err)
    }
  }

  const filteredEntries = journalEntries.filter((entry) => {
    const dateMatch = !filterDate || entry.date === filterDate
    const moodMatch = !filterMood || entry.mood === filterMood
    return dateMatch && moodMatch
  })

  const getMoodEmoji = (mood) => {
    const moodObj = moodOptions.find((m) => m.value === mood)
    return moodObj ? moodObj.emoji : "😊"
  }

  return (
    <div className="pet-journal-container">
      <Navbar />
      {/* Header */}
      <div className="journal-header">
        <h1>Pet Journal</h1>

        {/* Pet Selection */}
        <div className="pet-selector">
          <label>Select Pet: </label>
          <select
            value={selectedPet}
            onChange={(e) => setSelectedPet(e.target.value)}>
            <option value="">Choose a pet...</option>
            {petList.map((pet) => (
              <option key={pet.id} value={pet.petName}>
                {pet.petName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedPet && (
        <>
          {/* Action Bar */}
          <div className="action-bar">
            <button
              className="add-entry-btn"
              onClick={() => setShowAddEntry(!showAddEntry)}>
              {showAddEntry ? "Cancel" : "Add New Entry"}
            </button>

            {/* Filters */}
            <div className="filters">
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                placeholder="Filter by date"
              />
              <select
                value={filterMood}
                onChange={(e) => setFilterMood(e.target.value)}>
                <option value="">All moods</option>
                {moodOptions.map((mood) => (
                  <option key={mood.value} value={mood.value}>
                    {mood.emoji} {mood.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Add/Edit Entry Form */}
          {showAddEntry && (
            <div className="add-entry-form">
              <h3>{editingEntry ? "Edit Entry" : "Add New Entry"}</h3>

              <div className="form-group">
                <label>Date:</label>
                <input
                  type="date"
                  name="date"
                  value={newEntry.date}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Title:</label>
                <input
                  type="text"
                  name="title"
                  value={newEntry.title}
                  onChange={handleInputChange}
                  placeholder="Entry title..."
                />
              </div>

              <div className="form-group">
                <label>Mood:</label>
                <div className="mood-selector">
                  {moodOptions.map((mood) => (
                    <button
                      key={mood.value}
                      type="button"
                      className={`mood-btn ${newEntry.mood === mood.value ? "selected" : ""}`}
                      onClick={() =>
                        setNewEntry((prev) => ({ ...prev, mood: mood.value }))
                      }>
                      {mood.emoji} {mood.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Activities:</label>
                <div className="activities-selector">
                  {activityOptions.map((activity) => (
                    <button
                      key={activity}
                      type="button"
                      className={`activity-btn ${newEntry.activities.includes(activity) ? "selected" : ""}`}
                      onClick={() => handleActivityChange(activity)}>
                      {activity}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Content:</label>
                <textarea
                  name="content"
                  value={newEntry.content}
                  onChange={handleInputChange}
                  placeholder="What happened today with your pet?"
                  rows="4"
                />
              </div>

              <button className="save-entry-btn" onClick={handleSubmitEntry}>
                {editingEntry ? "Update Entry" : "Save Entry"}
              </button>
            </div>
          )}

          {/* Journal Entries */}
          <div className="journal-entries">
            <h3>Journal Entries for {selectedPet}</h3>

            {filteredEntries.length === 0 ? (
              <div className="no-entries">
                <p>No journal entries yet. Start by adding your first entry!</p>
              </div>
            ) : (
              <div className="entries-grid">
                {filteredEntries.map((entry) => (
                  <div key={entry.id} className="journal-entry">
                    <div className="entry-header">
                      <div className="entry-date">
                        {new Date(entry.date).toLocaleDateString()}
                      </div>
                      <div className="entry-mood">
                        {getMoodEmoji(entry.mood)}
                      </div>
                    </div>

                    <h4>{entry.title}</h4>
                    <p className="entry-content">{entry.content}</p>

                    {entry.activities && entry.activities.length > 0 && (
                      <div className="entry-activities">
                        <strong>Activities: </strong>
                        {entry.activities.join(", ")}
                      </div>
                    )}

                    <div className="entry-actions">
                      <button
                        className="edit-entry-btn"
                        onClick={() => handleEditEntry(entry)}>
                        Edit
                      </button>
                      <button
                        className="delete-entry-btn"
                        onClick={() => handleDeleteEntry(entry.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {!selectedPet && (
        <div className="no-pet-selected">
          <p>Please select a pet to view their journal entries.</p>
        </div>
      )}
    </div>
  )
}

export default PetJournal