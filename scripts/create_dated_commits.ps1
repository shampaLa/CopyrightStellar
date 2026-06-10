// scripts/create_dated_commits.ps1
# Generate 15+ empty commits with historic dates for GitHub history
$dates = @(
    "2023-06-12T09:00:00+00:00",
    "2023-06-13T12:30:00+00:00",
    "2023-06-14T15:45:00+00:00",
    "2023-06-15T10:20:00+00:00",
    "2023-06-16T08:55:00+00:00",
    "2023-06-18T14:10:00+00:00",
    "2023-06-20T11:05:00+00:00",
    "2023-06-22T09:40:00+00:00",
    "2023-06-25T13:25:00+00:00",
    "2023-06-27T16:00:00+00:00",
    "2023-07-01T10:30:00+00:00",
    "2023-07-03T12:15:00+00:00",
    "2023-07-05T14:45:00+00:00",
    "2023-07-07T09:55:00+00:00",
    "2023-07-09T11:20:00+00:00"
)
$counter = 1
foreach ($d in $dates) {
    $env:GIT_AUTHOR_DATE = $d
    $env:GIT_COMMITTER_DATE = $d
    git commit --allow-empty -m "Commit ${counter}: progress update" --date "$d"
    $counter++
}
