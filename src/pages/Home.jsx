import React from 'react';
import { Link } from 'react-router-dom';
import { ChessBoard, Users, User, Trophy } from 'lucide-react';

function Home() {
  const features = [
    { title: "Online Play", icon: Users, description: "Challenge players from around the world", link: "/onlineplay" },
    { title: "Offline Play", icon: User, description: "Practice against AI or play with friends locally", link: "/play" },
    { title: "Tournaments", icon: Trophy, description: "Participate in exciting chess tournaments", link: "/tournaments" },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gray-700 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Welcome to MukhiyaChessApp</h1>
          <p className="text-xl mb-8">Elevate your chess game with our innovative platform</p>
          <Link to="/onlineplay" className="bg-white text-blue-600 font-bold py-2 px-6 rounded-full hover:bg-blue-100 transition duration-300">
            Play Now
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto py-12 px-4">
        <section className="grid md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300">
              <feature.icon className="w-12 h-12 text-blue-600 mb-4" />
              <h2 className="text-2xl font-semibold mb-2">{feature.title}</h2>
              <p className="text-gray-600 mb-4">{feature.description}</p>
              <Link to={feature.link} className="text-blue-600 font-semibold hover:underline">
                Get Started →
              </Link>
            </div>
          ))}
        </section>

        <section className="bg-white p-8 rounded-lg shadow-md mb-16">
          <h2 className="text-3xl font-semibold mb-6">Why Choose MukhiyaChessApp?</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Advanced matchmaking system for fair and challenging games</li>
            <li>Interactive tutorials and puzzles to improve your skills</li>
            <li>Vibrant community of chess enthusiasts from around the world</li>
            <li>Regular tournaments with exciting prizes</li>
            <li>Comprehensive analysis tools to review and learn from your games</li>
          </ul>
        </section>

        <section className="text-center">
          <h2 className="text-3xl font-semibold mb-6">Ready to make your move?</h2>
          <Link to="/register" className="bg-blue-600 text-white font-bold py-3 px-8 rounded-full hover:bg-blue-700 transition duration-300">
            Sign Up Now
          </Link>
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm mb-4 md:mb-0">&copy; 2024 MukhiyaChessApp. All rights reserved.</p>
          <nav className="flex space-x-4">
            <Link to="/about" className="hover:text-blue-300">About</Link>
            <Link to="/contact" className="hover:text-blue-300">Contact</Link>
            <Link to="/privacy" className="hover:text-blue-300">Privacy Policy</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

export default Home;


// import React from 'react';

// function Home() {
//   return (
//     <div className="text-center min-h-screen bg-gray-100">
//       <header className="bg-blue-600 text-white p-8">
//         <h1 className="text-4xl font-bold">Welcome to MukhiyaChessApp</h1>
//       </header>
//       <main className="p-6 max-w-4xl mx-auto">
//         <section className="my-8">
//           <h2 className="text-2xl font-semibold">Thank you for visiting!</h2>
//           <p className="text-gray-700 mt-4">
//             MukhiyaChessApp is dedicated to all chess enthusiasts. Whether you're a beginner or a seasoned player, our platform is designed to help you enjoy and improve your chess skills.
//           </p>
//         </section>
//         <section className="my-8">
//           <h2 className="text-2xl font-semibold">Benefits of Playing Chess</h2>
//           <ul className="list-disc list-inside text-gray-700 mt-4">
//             <li>Enhances cognitive abilities and problem-solving skills.</li>
//             <li>Improves memory and concentration.</li>
//             <li>Boosts creativity and strategic thinking.</li>
//             <li>Teaches patience, discipline, and the importance of planning ahead.</li>
//             <li>Fosters social interactions and connections through community play.</li>
//           </ul>
//         </section>
//         <section className="my-8">
//           <h2 className="text-2xl font-semibold">Why Should You Play Chess?</h2>
//           <p className="text-gray-700 mt-4">
//             Chess is more than just a game; it's a mental workout. Playing chess regularly can have numerous positive effects on your brain health and overall well-being. It encourages critical thinking, improves decision-making skills, and provides a constructive way to spend your leisure time.
//           </p>
//         </section>
//         <section className="my-8">
//           <h2 className="text-2xl font-semibold">A Brief History of Chess</h2>
//           <p className="text-gray-700 mt-4">
//             Chess is believed to have originated in India around the 6th century AD, where it was known as Chaturanga. The game then spread to Persia and later to Europe and the rest of the world. Over the centuries, chess has evolved, with standardized rules and formats becoming established in the 19th century. Today, chess is played and celebrated globally, with numerous tournaments and a rich tradition of grandmasters who have shaped the game.
//           </p>
//         </section>
//       </main>
//       <footer className="bg-blue-600 text-white p-4">
//         <p className="text-sm">&copy; 2024 MukhiyaChessApp. All rights reserved.</p>
//       </footer>
//     </div>
//   );
// }

// export default Home;

