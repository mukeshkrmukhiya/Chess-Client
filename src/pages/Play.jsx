import React from 'react';
import Chessboard from '../components/ChessBoard';

function Home() {
  return (
    <div className="text-center">
      <header className="bg-blue-500 text-white p-6">
        <h1 className="text-xl font-bold">Welcome Back Play Chess in Free Time</h1>
      </header>
      <main className="p-6">
        <Chessboard/>
      </main>
    </div>
  );
}

export default Home;
