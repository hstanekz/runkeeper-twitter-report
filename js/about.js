function parseTweets(runkeeper_tweets) {
  //Do not proceed if no tweets loaded
  if (runkeeper_tweets === undefined) {
    window.alert("No tweets returned");
    return;
  }

  tweet_array = runkeeper_tweets.map(function (tweet) {
    return new Tweet(tweet.text, tweet.created_at);
  });

  //This line modifies the DOM, searching for the tag with the numberTweets ID and updating the text.
  //It works correctly, your task is to update the text of the other tags in the HTML file!
  const total_tweets = tweet_array.length;
  document.getElementById("numberTweets").innerText = total_tweets;

  let firstDateVal = tweet_array[0].time;
  let lastDateVal = tweet_array[0].time;

  let user_written_completed_events = 0;

  // Track total number of various tweet categories
  let counters = {
    completed_event: 0,
    achievement: 0,
    live_event: 0,
    miscellaneous: 0,
  };

  tweet_array.forEach((tweet) => {
    // Find earliest and latest tweet dates
    if (tweet.time < firstDateVal) {
      firstDateVal = tweet.time;
    } else if (tweet.time > lastDateVal) {
      lastDateVal = tweet.time;
    }

    // Increment total tweet categories
    counters[tweet.source]++;

    if (tweet.source === "completed_event" && tweet.written) {
      user_written_completed_events++;
    }
  });

  // Update DOM values for firstDate and lastDate
  $("#firstDate").text(firstDateVal.toLocaleDateString());
  $("#lastDate").text(lastDateVal.toLocaleDateString());

  // Total tweets by categories
  const total_completed_event = $(".completedEvents").text(
    counters.completed_event
  );
  const total_live_event = $(".liveEvents").text(counters.live_event);
  const total_achievements = $(".achievements").text(counters.achievement);
  const total_misc = $(".miscellaneous").text(counters.miscellaneous);

  // Calculate percentages
  const completed_event_pct = $(".completedEventsPct").text(
    ((counters.completed_event / total_tweets) * 100).toFixed(2) + "%"
  );
  const live_event_pct = $(".liveEventsPct").text(
    ((counters.live_event / total_tweets) * 100).toFixed(2) + "%"
  );
  const achievements_pct = $(".achievementsPct").text(
    ((counters.achievement / total_tweets) * 100).toFixed(2) + "%"
  );
  const misc_pct = $(".miscellaneousPct").text(
    ((counters.miscellaneous / total_tweets) * 100).toFixed(2) + "%"
  );

  // Update DOM values for user-written text in completed events
  const user_written_pct = (
    (user_written_completed_events / counters.completed_event) *
    100
  ).toFixed(2);
  $(".completedEvents").text(counters.completed_event);
  $(".written").text(user_written_completed_events);
  $(".writtenPct").text(user_written_pct + "%");
}

//Wait for the DOM to load
document.addEventListener("DOMContentLoaded", function (event) {
  loadSavedRunkeeperTweets().then(parseTweets);
});
