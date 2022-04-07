let button = document.getElementById('rules-button');

button.addEventListener('click', function() {
    openNav();
});

/* Set the width of the side navigation to 250px */
function openNav() {
  document.getElementById("rules").style.width = "500px";
}

/* Set the width of the side navigation to 0 */
function closeNav() {
  document.getElementById("rules").style.width = "0";
}
