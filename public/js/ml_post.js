document.getElementById('overviewBtn').addEventListener('click', function() {
    const postsOverview = document.getElementById('postsOverview');
    if (postsOverview.style.display === 'none') {
        postsOverview.style.display = 'block';
    } else {
        postsOverview.style.display = 'none';
    }
});