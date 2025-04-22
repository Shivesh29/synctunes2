import { useState, useEffect } from 'react';
import { transferAllTracks } from '../services/transferService';

export default function TransferProgress({ tracks, spotifyApi, youtubeApi }) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('pending');
  const [results, setResults] = useState([]);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    const savedState = localStorage.getItem('transferState');
    if (savedState) {
      const { progress, results, errors } = JSON.parse(savedState);
      setProgress(progress);
      setResults(results);
      setErrors(errors);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('transferState', JSON.stringify({ progress, results, errors }));
  }, [progress, results, errors]);

  async function startTransfer() {
    setStatus('processing');
    const transferResults = await transferAllTracks(tracks, spotifyApi, youtubeApi);
    setResults(transferResults);

    const failed = transferResults.filter(result => !result.success);
    setErrors(failed);
    setProgress(100);
    setStatus(failed.length > 0 ? 'failed' : 'complete');
  }

  return (
    <div>
      <h2>Transfer Progress</h2>
      <progress value={progress} max="100">{progress}%</progress>
      <button onClick={startTransfer} disabled={status === 'processing'}>
        {status === 'processing' ? 'Transferring...' : 'Start Transfer'}
      </button>

      <div>
        <h3>Transfer Results</h3>
        <ul>
          {results.map((result, index) => (
            <li key={index}>
              {result.track.title} - {result.success ? 'Success' : `Failed: ${result.reason}`}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
