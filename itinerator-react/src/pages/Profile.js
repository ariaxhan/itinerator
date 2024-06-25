import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { addDoc, collection, getDocs, getFirestore } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import '../css/styles.css';
import { Link } from 'react-router-dom';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [itineraries, setItineraries] = useState([]);
  const [newItinerary, setNewItinerary] = useState('');
  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const fetchItineraries = async (userId) => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users', userId, 'savedItineraries'));
        const fetchedItineraries = [];
        querySnapshot.forEach((doc) => {
          console.log("Fetched doc: ", doc.data());
          fetchedItineraries.push({ ...doc.data(), id: doc.id });
        });
        setItineraries(fetchedItineraries);
      } catch (error) {
        console.error("Error fetching itineraries: ", error);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        fetchItineraries(user.uid);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [auth, db]);

  const handleAddItinerary = async () => {
    if (newItinerary.trim() === '') return;
    try {
      const docRef = await addDoc(collection(db, 'users', user.uid, 'savedItineraries'), {
        name: newItinerary,
        savedAt: new Date()
      });
      setItineraries([...itineraries, { name: newItinerary, id: docRef.id }]);
      setNewItinerary('');
    } catch (error) {
      console.error("Error adding itinerary: ", error);
    }
  };

  return (
    <div className="container">
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
            <br/>
           
          </div>
          <div className="profile-header">
            <h2>Profile</h2>
          </div>
          {user ? (
            <div className="profile-content">
              <div className="profile-details">
                <h3>User Details</h3>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>User ID:</strong> {user.uid}</p>
              </div>
              <div className="profile-itineraries">
                <h3>Saved Itineraries</h3>
                <ul>
                  {itineraries.map((itinerary) => (
                    <li key={itinerary.id}>
                      <h4>Itinerary</h4>
                      <ReactMarkdown>{itinerary.itinerary}</ReactMarkdown>
                    </li>
                  ))}
                </ul>
                <div className="add-itinerary">
                  <input
                    type="text"
                    value={newItinerary}
                    onChange={(e) => setNewItinerary(e.target.value)}
                    placeholder="Add new itinerary"
                  />
                  <button className="button" onClick={handleAddItinerary}>Add Itinerary</button>
                </div>
              </div>
            </div>
          ) : (
            <p>Please log in to view your profile and saved itineraries.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;