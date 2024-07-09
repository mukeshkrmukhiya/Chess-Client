import React from 'react';
import Chessboard from '../components/ChessBoard';

function Home() {
  return (
    <div className="text-center">
      {/* <header className="bg-blue-500 text-white p-6">
        <h1 className="text-xl font-bold">Welcome Back! Play Chess Offline with your Friend</h1>
      </header> */}
      <div className="">
        <Chessboard />
      </div>
    </div>
  );
}

export default Home;
