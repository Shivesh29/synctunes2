import React from 'react';

function TransferResult({ result }) {
    return (
        <div>
            <h3>Transfer Complete</h3>
            <p>
                <a href={result.youtubeUrl} target="_blank" rel="noopener noreferrer">
                    View on YouTube
                </a>
            </p>
            <p>
                <a href={result.youtubeMusicUrl} target="_blank" rel="noopener noreferrer">
                    View on YouTube Music
                </a>
            </p>
            <p>
                Note: YouTube Music visibility may vary based on your region and account settings.
            </p>
        </div>
    );
}

export default TransferResult;