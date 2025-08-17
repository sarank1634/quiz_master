import React from 'react';

const Sidebar = () => {
  return (
    <aside>
      {/* Sidebar content goes here */}
      <nav>
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/dashboard">Dashboard</a></li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
