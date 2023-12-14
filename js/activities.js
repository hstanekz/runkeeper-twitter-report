function parseTweets(runkeeper_tweets) {
  //Do not proceed if no tweets loaded
  if (runkeeper_tweets === undefined) {
    window.alert("No tweets returned");
    return;
  }

  tweet_array = runkeeper_tweets.map(function (tweet) {
    return new Tweet(tweet.text, tweet.created_at);
  });
  const completedTweets = tweet_array.filter(
    (tweet) => tweet.source === "completed_event"
  );

  // Declare variables
  const activityFrequencies = {};
  let totalWeekdayDistance = 0;
  let totalWeekendDistance = 0;
  let weekdayCount = 0;
  let weekendCount = 0;
  let longestDistance = 0;
  let shortestDistance = Infinity;
  let longestActivityType = "";
  let shortestActivityType = "";

  completedTweets.forEach((tweet) => {
    const activityType = tweet.activityType;
    const distance = tweet.distance;

    // Calculate activity frequencies
    if (activityType != "unknown") {
      activityFrequencies[activityType] =
        (activityFrequencies[activityType] || 0) + 1;
    }

    // Calculate longest and shortest activities
    if (distance > longestDistance) {
      longestDistance = distance;
      longestActivityType = activityType;
    }
    if (distance > 0 && distance < shortestDistance) {
      shortestDistance = distance;
      shortestActivityType = activityType;
    }

    // Calculate total distances for weekdays and weekends
    const dayOfWeek = tweet.time.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      // 0 = Sunday, 6 = Saturday
      totalWeekendDistance += distance;
      weekendCount++;
    } else {
      totalWeekdayDistance += distance;
      weekdayCount++;
    }
  });

  // Calculate the most frequent activity types
  const sortedActivities = Object.entries(activityFrequencies).sort(
    (a, b) => b[1] - a[1]
  );
  const firstMost = sortedActivities[0] ? sortedActivities[0][0] : "N/A";
  const secondMost = sortedActivities[1] ? sortedActivities[1][0] : "N/A";
  const thirdMost = sortedActivities[2] ? sortedActivities[2][0] : "N/A";

  // Calculate average distances for weekdays and weekends
  const averageWeekdayDistance =
    weekdayCount > 0 ? totalWeekdayDistance / weekdayCount : 0;
  const averageWeekendDistance =
    weekendCount > 0 ? totalWeekendDistance / weekendCount : 0;
  const weekdayOrWeekendLonger =
    averageWeekdayDistance > averageWeekendDistance ? "Weekdays" : "Weekends";

  // Update DOM
  $("#numberActivities").text(7);
  $("#firstMost").text(firstMost);
  $("#secondMost").text(secondMost);
  $("#thirdMost").text(thirdMost);
  $("#longestActivityType").text(longestActivityType);
  $("#shortestActivityType").text(shortestActivityType);
  $("#weekdayOrWeekendLonger").text(weekdayOrWeekendLonger);

  const activityData = Object.entries(activityFrequencies).map(
    ([activity, frequency]) => ({
      activity,
      frequency,
    })
  );

  activity_vis_spec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    description:
      "A graph of the number of Tweets containing each type of activity.",
    data: {
      values: activityData,
    },
    mark: "bar",
    encoding: {
      x: {
        field: "activity",
        type: "ordinal",
        axis: { title: "Activity Type" },
      },
      y: {
        field: "frequency",
        type: "quantitative",
        axis: { title: "Frequency" },
      },
    },
  };
  vegaEmbed("#activityVis", activity_vis_spec, { actions: false });

  // Distance plots
  visualizeActivityDistancesByDayOfWeek(completedTweets, [
    firstMost,
    secondMost,
    thirdMost,
  ]);
  visualizeAggregatedActivityDistancesByDayOfWeek(completedTweets, [
    firstMost,
    secondMost,
    thirdMost,
  ]);
}

function visualizeActivityDistancesByDayOfWeek(completedTweets, topActivities) {
  const data = completedTweets
    .filter((tweet) => topActivities.includes(tweet.activityType))
    .map((tweet) => ({
      day: tweet.time.toLocaleString("en-US", { weekday: "long" }),
      distance: tweet.distance,
      activityType: tweet.activityType,
    }));

  const spec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    description: "Activity distances by day of the week",
    data: { values: data },
    mark: "point",
    encoding: {
      x: { field: "day", type: "ordinal", title: "Time (day)" },
      y: { field: "distance", type: "quantitative", title: "Distance (mi)" },
      color: { field: "activityType", type: "nominal", title: "Activity Type" },
    },
  };

  vegaEmbed("#distanceVis", spec, { actions: false });
}

function visualizeAggregatedActivityDistancesByDayOfWeek(
  completedTweets,
  topActivities
) {
  const data = completedTweets
    .filter((tweet) => topActivities.includes(tweet.activityType))
    .map((tweet) => ({
      day: tweet.time.toLocaleString("en-US", { weekday: "long" }),
      distance: tweet.distance,
      activityType: tweet.activityType,
    }));

  const spec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    description: "Average activity distances by day of the week",
    data: { values: data },
    transform: [
      {
        aggregate: [{ op: "mean", field: "distance", as: "averageDistance" }],
        groupby: ["day", "activityType"],
      },
    ],
    mark: "point",
    encoding: {
      x: { field: "day", type: "ordinal", title: "Time (day)" },
      y: {
        field: "averageDistance",
        type: "quantitative",
        title: "Average Distance (mi)",
      },
      color: { field: "activityType", type: "nominal", title: "Activity Type" },
    },
  };

  // Render the plot
  vegaEmbed("#distanceVisAggregated", spec, { actions: false });
}

//Wait for the DOM to load
document.addEventListener("DOMContentLoaded", function (event) {
  loadSavedRunkeeperTweets().then(parseTweets);

  $(document).ready(function () {
    //  Hide the aggregated plot
    $("#distanceVisAggregated").hide();

    // Switch between plots
    $("#aggregate").click(function () {
      $("#distanceVis, #distanceVisAggregated").toggle();
      if ($(".btn").text() === "Show means") {
        $(".btn").text("Show all activities");
      } else {
        $(".btn").text("Show means");
      }
    });
  });
});
