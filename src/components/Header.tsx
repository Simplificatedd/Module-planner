import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center mb-8">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Semester Planner</h1>
      <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
        Created by Raven Tang
        <a
          href="https://www.linkedin.com/in/raven-tang/"
          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 ml-2 inline-flex items-center gap-1 transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd"></path>
          </svg>
        </a>
      </p>
    </header>
  );
};

export default Header;
