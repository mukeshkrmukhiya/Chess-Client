import React from 'react';

function Home() {
  return (
    <div className="text-center min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-8">
        <h1 className="text-4xl font-bold">Welcome to MukhiyaChessApp</h1>
      </header>
      <main className="p-6 max-w-4xl mx-auto">
        <section className="my-8">
          <h2 className="text-2xl font-semibold">Thank you for visiting!</h2>
          <p className="text-gray-700 mt-4">
            MukhiyaChessApp is dedicated to all chess enthusiasts. Whether you're a beginner or a seasoned player, our platform is designed to help you enjoy and improve your chess skills.
          </p>
        </section>
        <section className="my-8">
          <h2 className="text-2xl font-semibold">Benefits of Playing Chess</h2>
          <ul className="list-disc list-inside text-gray-700 mt-4">
            <li>Enhances cognitive abilities and problem-solving skills.</li>
            <li>Improves memory and concentration.</li>
            <li>Boosts creativity and strategic thinking.</li>
            <li>Teaches patience, discipline, and the importance of planning ahead.</li>
            <li>Fosters social interactions and connections through community play.</li>
          </ul>
        </section>
        <section className="my-8">
          <h2 className="text-2xl font-semibold">Why Should You Play Chess?</h2>
          <p className="text-gray-700 mt-4">
            Chess is more than just a game; it's a mental workout. Playing chess regularly can have numerous positive effects on your brain health and overall well-being. It encourages critical thinking, improves decision-making skills, and provides a constructive way to spend your leisure time.
          </p>
        </section>
        <section className="my-8">
          <h2 className="text-2xl font-semibold">A Brief History of Chess</h2>
          <p className="text-gray-700 mt-4">
            Chess is believed to have originated in India around the 6th century AD, where it was known as Chaturanga. The game then spread to Persia and later to Europe and the rest of the world. Over the centuries, chess has evolved, with standardized rules and formats becoming established in the 19th century. Today, chess is played and celebrated globally, with numerous tournaments and a rich tradition of grandmasters who have shaped the game.
          </p>
        </section>
      </main>
      <footer className="bg-blue-600 text-white p-4">
        <p className="text-sm">&copy; 2024 MukhiyaChessApp. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Home;

