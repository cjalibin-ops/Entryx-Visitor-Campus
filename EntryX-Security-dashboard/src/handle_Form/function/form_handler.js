document.getElementById('contact-form').addEventListener('submit', function(event) {
          event.preventDefault();
      
          // Collect form data
          const formData = new FormData(this);
      
          // Send form data using AJAX
          const xhr = new XMLHttpRequest();
          xhr.open('POST', 'php-form/form_handler.php', true);
          xhr.onreadystatechange = function() {
              if (xhr.readyState === XMLHttpRequest.DONE) {
                  if (xhr.status === 200) {
                      alert('Message sent successfully!');
                      // You can update the UI as needed here
                  } else {
                      alert('Error sending message.');
                  }
              }
          };
          xhr.send(formData);
      });
      