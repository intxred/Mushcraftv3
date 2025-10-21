
document.getElementById('logoutBtn').addEventListener('click', function(e) {
    e.preventDefault();
    const confirmLogout = confirm("Are you sure you want to log out?");
    if (confirmLogout) {
        window.location.href = "auth/logout.php";
    }
});
// Wait for the DOM to load
document.addEventListener("DOMContentLoaded", function() {
    // Get buttons by their ID
    const btnExplore = document.getElementById("btnExplore");
    const btnLearn = document.getElementById("btnContact");

    // Add click event listeners
    btnExplore.addEventListener("click", function() {
        alert("To be added on future versions!");
    });

    btnLearn.addEventListener("click", function() {
        alert("To be added on future versions!");
    });
});
