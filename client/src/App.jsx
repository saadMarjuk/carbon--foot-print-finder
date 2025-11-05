import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [url, setUrl] = useState("");
  const [data, setData] = useState([]);
  const [latest, setLatest] = useState(null);

  // Fetch all entries
  const fetchData = async () => {
    try {
      const res = await axios.get("/api/data"); // Relative path for Render
      setData(res.data);
      if (res.data.length) setLatest(res.data[0]);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Add new URL
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url) return;
    try {
      const res = await axios.post("/api/data", { url }); // Relative path
      setData([res.data, ...data]);
      setLatest(res.data);
      setUrl("");
    } catch (err) {
      console.error("Error adding data:", err);
    }
  };

  // Delete an entry
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/data/${id}`); // Relative path
      setData(data.filter(d => d.id !== id));
    } catch (err) {
      console.error("Error deleting data:", err);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="app-container">
      <h1 className="app-title">🌱 Website Carbon Checker</h1>

      {/* URL Form */}
      <form onSubmit={handleSubmit} className="url-form">
        <input
          type="url"
          placeholder="Enter website URL (e.g., https://facebook.com)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="url-input"
          required
        />
        <button className="url-button">Check</button>
      </form>

      {/* Latest Result */}
      {latest && (
        <div className="result-card">
          <div className="rating">{latest.rating}</div>
          <h2 className="result-url">Website carbon results for: {latest.url}</h2>
          <p className="result-text">Hurrah! This web page achieves a carbon rating of {latest.rating}</p>
          <p className="result-text">
            This is cleaner than <span className="percent">{latest.percentCleaner}%</span> of all web pages globally
          </p>
          <p className="result-text">
            This page was last tested on {formatDate(latest.date)}. <button className="test-again">Test again</button>
          </p>
          <p className="result-text">
            Only <span className="carbon-value">{latest.carbon}g</span> of CO2 is produced every time someone visits this web page.
          </p>

          <div className="yearly-impact">
            <h3>Over a year, with 10,000 monthly page views:</h3>
            <ul>
              <li>{latest.url} produces {(latest.carbon * 10000).toFixed(2)} kg of CO2 equivalent</li>
              <li>As much CO2 as boiling water for {(latest.carbon * 10000 * 644 / 4.75).toFixed(0)} cups of tea</li>
              <li>Equivalent to 1 tree absorption in a year</li>
              <li>As much CO2 as 801 full charges of an average smartphone</li>
            </ul>
          </div>
        </div>
      )}

      {/* Previous entries table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>URL</th>
              <th>Carbon</th>
              <th>Rating</th>
              <th>% Cleaner</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map(d => (
              <tr key={d.id}>
                <td>{d.url}</td>
                <td>{d.carbon}</td>
                <td>{d.rating}</td>
                <td>{d.percentCleaner}%</td>
                <td>
                  <button className="delete-btn" onClick={() => handleDelete(d.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
