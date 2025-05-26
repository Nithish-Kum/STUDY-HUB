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
            'ai-tools': 'AI Tools for Students'
      };

      if (section === 'ai-tools') {
            window.location.href = '/ai tools/index.html';
      } else if (section === 'notes') {
            window.location.href = '/notes/index.html';
      }
      else if(section === 'forum')
      {
            window.location.href='/Doubt Discussion form/index.html';
      }
      else if(section === 'resume')
      {
            window.location.href='/Resume Builder/index.html';
      }
      else if(section === 'hackathons')
      {
            window.location.href='/Hackathons/index.html';
      }
      else if(section === 'planner')
      {
            window.location.href='/Timetable/index.html';
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
});