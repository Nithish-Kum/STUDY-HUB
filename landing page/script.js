function navigateTo(section) {
      // Add a subtle click animation
      event.target.style.transform = 'scale(0.95)';
      setTimeout(() => {
            event.target.style.transform = '';
      }, 150);

      // Here you would typically navigate to different pages/sections
      console.log('Navigating to:', section);

      // For demonstration, show an alert
      const sectionNames = {
            'notes': 'Notes & Study Materials',
            'forum': 'Doubt Discussion Forum',
            'hackathons': 'Hackathons Uploading',
            'resume': 'Resume Builder Tool',
            'planner': 'Timetable & Reminder Planner',
            'ai-tools': 'AI Tools for Students',
            'dashboard': 'Student Dashboard'
      };

      if (section === 'ai-tools') {
            window.location.href = '/ai tools/index.html';
      } else if (section === 'notes') {
            window.location.href = '/notes/index.html';
      }
      else if (section === 'forum') {
            window.location.href = '/Doubt Discussion form/index.html';
      }
      else if (section === 'resume') {
            window.location.href = '/Resume Builder/index.html';
      }
      else if (section === 'hackathons') {
            window.location.href = '/Hackathons/index.html';
      }
      else if (section === 'planner') {
            window.location.href = '/Timetable/index.html';
      }
      else if (section === 'dashboard') {
            window.location.href = '/dashboard/index.html'; 
      }

}

// Add some interactive effects
document.addEventListener('DOMContentLoaded', function () {
      const buttons = document.querySelectorAll('.feature-button');

      buttons.forEach(button => {
            button.addEventListener('mouseenter', function () {
                  this.style.background = 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)';
            });

            button.addEventListener('mouseleave', function () {
                  this.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            });
      });
      document.body.classList.add('light');
  document.getElementById('themeToggle').checked = true;
});
// Theme switch
document.getElementById('themeToggle').addEventListener('change', function () {
  document.body.classList.toggle('light', this.checked);
});

// Mobile menu toggle
document.getElementById('menuToggle').addEventListener('click', function () {
  document.getElementById('sidebar').classList.toggle('active');
});

// Search suggestions
const searchBar = document.getElementById('searchBar');
const suggestionsBox = document.getElementById('searchSuggestions');

searchBar.addEventListener('focus', () => {
  suggestionsBox.classList.remove('hidden');
});

searchBar.addEventListener('blur', () => {
  setTimeout(() => suggestionsBox.classList.add('hidden'), 150); // allow click
});

searchBar.addEventListener('input', () => {
  const term = searchBar.value.toLowerCase();
  document.querySelectorAll('#searchSuggestions li').forEach(item => {
    const match = item.textContent.toLowerCase().includes(term);
    item.style.display = match ? 'block' : 'none';
  });
});

// Navigate on suggestion click
document.querySelectorAll('#searchSuggestions li').forEach(item => {
  item.addEventListener('click', () => {
    const text = item.textContent.toLowerCase();
    if (text.includes("note")) navigateTo("notes");
    else if (text.includes("forum")) navigateTo("forum");
    else if (text.includes("hackathon")) navigateTo("hackathons");
    else if (text.includes("resume")) navigateTo("resume");
    else if (text.includes("planner")) navigateTo("planner");
    else if (text.includes("ai")) navigateTo("ai-tools");
    else if (text.includes("dashboard")) navigateTo("dashboard");
  });
});
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const backdrop = document.getElementById('sidebarBackdrop');

menuToggle.addEventListener('click', () => {
  sidebar.classList.toggle('active');
  backdrop.classList.toggle('hidden');
});

backdrop.addEventListener('click', () => {
  sidebar.classList.remove('active');
  backdrop.classList.add('hidden');
});
document.getElementById('menuToggleTop').addEventListener('click', () => {
  sidebar.classList.toggle('active');
  backdrop.classList.toggle('hidden');
});
