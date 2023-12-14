let user_written_tweets = [];

function parseTweets(runkeeper_tweets) {
  //Do not proceed if no tweets loaded
  if (runkeeper_tweets === undefined) {
    window.alert("No tweets returned");
    return;
  }

  //TODO: Filter to just the written tweets
  let tweet_array = [];
  tweet_array = runkeeper_tweets.map((tweet) => new Tweet(tweet.text));
  user_written_tweets = tweet_array.filter((tweet) => tweet.written);
}

function addEventHandlerForSearch() {
  //TODO: Search the written tweets as text is entered into the search box, and add them to the table

  const tweetTable = $("#tweetTable");
  const searchCount = $("#searchCount").text(0);
  const searchText = $("#searchText").text("");
  const searchInput = $("#textFilter");

  searchInput.on("input", function (e) {
    const value = $(this).val().toLowerCase();
    let visibleTweets = 0;
    tweetTable.empty(); // Clear the current rows

    if (value === "") {
      searchCount.text(0);
      searchText.text("");
    } else {
      user_written_tweets.forEach((tweet) => {
        if (tweet.text.toLowerCase().includes(value)) {
          const row = tweet.getHTMLTableRow(visibleTweets + 1); // Row number
          tweetTable.append(row);
          visibleTweets++;
        }
      });
    }
    searchCount.text(visibleTweets);
    searchText.text(value);
  });
}

//Wait for the DOM to load
document.addEventListener("DOMContentLoaded", function (event) {
  addEventHandlerForSearch();
  loadSavedRunkeeperTweets().then(parseTweets);
});
