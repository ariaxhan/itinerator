import { addDoc, collection, doc, onSnapshot, updateDoc } from 'firebase/firestore'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import React, { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Link, useParams } from 'react-router-dom'
import { auth, db } from '../FirebaseConfig'
import '../css/results.css'
import Map from '../components/Map'
import RegexMatcher from '../components/RegexMatcher'
import { initEngine, generateItinerary, isWebGPUSupported } from '../services/webllm'

const Results = () => {
  const { quizId } = useParams()
  const [response, setResponse] = useState(null)
  const contentRef = useRef(null)
  const [user, setUser] = useState(null)
  const [locations, setLocations] = useState([])
  const [loadingModel, setLoadingModel] = useState(false)
  const [modelProgress, setModelProgress] = useState('')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState(null)
  const [webgpuSupported, setWebgpuSupported] = useState(true)
  const generationStarted = useRef(false)

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      setUser(user || null)
    })

    if (quizId) {
      const docRef = doc(db, 'quizResponses', quizId)
      const unsubscribeDoc = onSnapshot(docRef, async (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data()
          if (data.itinerary) {
            setResponse(data.itinerary)
          } else if (!generationStarted.current) {
            generationStarted.current = true

            if (!isWebGPUSupported()) {
              setWebgpuSupported(false)
              return
            }

            try {
              setLoadingModel(true)
              await initEngine((report) => {
                setModelProgress(report.text || '')
              })
              setLoadingModel(false)

              setGenerating(true)
              const itinerary = await generateItinerary(data)
              setGenerating(false)

              await updateDoc(docRef, { itinerary })
            } catch (err) {
              console.error('Generation error:', err)
              setError(err.message || 'Failed to generate itinerary')
              setLoadingModel(false)
              setGenerating(false)
            }
          }
        } else {
          console.log('No such document!')
        }
      })

      return () => {
        unsubscribeDoc()
        unsubscribeAuth()
      }
    }
  }, [quizId])

  const saveAsPDF = () => {
    html2canvas(contentRef.current).then((canvas) => {
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgProps = pdf.getImageProperties(imgData)
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save('itinerary.pdf')
    })
  }

  const getShareableLink = () => {
    return `${window.location.origin}/itinerary/${quizId}`
  }

  const saveToProfile = async () => {
    if (!user) {
      alert('You must be logged in to save the itinerary to your profile.')
      return
    }

    try {
      await addDoc(collection(db, 'users', user.uid, 'savedItineraries'), {
        quizId,
        itinerary: response,
        savedAt: new Date(),
      })
      alert('Itinerary saved to your profile successfully!')
    } catch (error) {
      console.error('Error saving itinerary: ', error)
      alert('Failed to save itinerary. Please try again.')
    }
  }

  const handleExtract = (locations) => {
    setLocations(locations)
  }

  const renderLoading = () => {
    if (!webgpuSupported) {
      return (
        <div className="webgpu-fallback">
          <h2>WebGPU Not Supported</h2>
          <p>Your browser does not support WebGPU, which is needed to run the AI model.</p>
          <p>Please try one of these browsers:</p>
          <ul>
            <li>Google Chrome 113+</li>
            <li>Microsoft Edge 113+</li>
            <li>Chrome on Android</li>
          </ul>
        </div>
      )
    }

    if (error) {
      return (
        <div className="generation-error">
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <button className="button" onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      )
    }

    if (loadingModel) {
      return (
        <div className="model-loading">
          <div className="spinner"></div>
          <h2>Downloading AI Model</h2>
          <p className="model-progress">{modelProgress}</p>
          <p className="model-hint">
            This only happens once — the model is cached for future visits.
          </p>
        </div>
      )
    }

    if (generating) {
      return (
        <div className="generating">
          <div className="spinner"></div>
          <h2>Generating Your Itinerary</h2>
          <p>The AI is crafting your personalized travel plan...</p>
        </div>
      )
    }

    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
        <div>Loading itinerary...</div>
      </div>
    )
  }

  return (
    <div className="container" ref={contentRef}>
      <div className="content-wrapper">
        <div className="content">
          <div className="header">
            <img
              loading="lazy"
              srcSet="https://cdn.builder.io/api/v1/image/assets/TEMP/18c1060fdb7de4a2128a3e5d304fea376e03e36e1f38556ee5a3fa91aae67d3d?apiKey=95bdd6893dbc47d0ac51c502bd26afe2&width=2000 2000w"
              className="logo"
              alt="Logo"
            />
            <Link to="/" className="title-link">
              Itinerator
            </Link>
          </div>
          <div className="results-container">
            <div className="results-header">
              <h1>Generated Itinerary</h1>
            </div>
            {response ? (
              <div className="itinerary">
                <ReactMarkdown>{response}</ReactMarkdown>
                <RegexMatcher text={response} onExtract={handleExtract} />
                <Map locations={locations} />
                <div className="actions">
                  <button className="button" onClick={saveAsPDF}>
                    Save as PDF
                  </button>
                  <button
                    className="button"
                    onClick={() => navigator.clipboard.writeText(getShareableLink())}
                  >
                    Copy Shareable Link
                  </button>
                  <button className="button" onClick={saveToProfile}>
                    Save to Profile
                  </button>
                </div>
                <div className="donate-link">
                  <a
                    href="https://ko-fi.com/ariaxhan"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Support this project
                  </a>
                </div>
              </div>
            ) : (
              renderLoading()
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Results
