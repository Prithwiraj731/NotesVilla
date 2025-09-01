// Quick API test - run this in browser console to test API connectivity
// Copy and paste this in your browser developer console while on the Notes page

console.log('🧪 Testing API endpoints...');

// Test 1: Check if API base is reachable
fetch('/api/notes/subjects')
  .then(response => {
    console.log('✅ Subjects endpoint status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('📊 Subjects data:', data);
  })
  .catch(error => {
    console.error('❌ Subjects error:', error);
  });

// Test 2: Check if getAllNotes endpoint is reachable  
fetch('/api/notes')
  .then(response => {
    console.log('✅ Notes endpoint status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('📝 Notes data:', data);
    console.log('📊 Number of notes:', data.length);
    if (data.length > 0) {
      console.log('🎯 Sample note:', data[0]);
    }
  })
  .catch(error => {
    console.error('❌ Notes error:', error);
  });

console.log('🔍 Check network tab in developer tools for detailed request/response info');