# CHANGELOG

## 0.9.1

- Bumped dependencies
- Fixed incorrect userAttempt count
- Fixed incorrect class names on multiple selection

## 0.9.0

- Added Progress Bar
- Bumped dependencies
- Fixed undefined className
- Exposed time taken in result object

## 0.8.2

- Bumped dependencies
- Fixed missing locale text in answers dropdown filter

## 0.8.1

- Bumped dependencies
- Fixed incorrect disableAll & selectedButtons
- Replaced uuidv4 by nanoid

## 0.8.0

- Bumped dependencies
- Introduced Timer Support with Pause / Resume
- Supported unanswered questions

## 0.7.1

- Bumped dependencies
- Fixed duplicate question on shuffle
- Fixed missing correct answers when setting showInstantfeedback to true

## 0.7.0

- Fixed lint issues
- Refactored webpack, filter design
- Updated demo site
- Added rollup
- Bumped dependencies

## 0.6.0

- Displayed marks in questions (marksOfQuestion)
- Bumped dependencies
- Added renovate
- Added ShuffleAnswer
- Added total count of questions
- Responsive Design
- Revised demo site
- Fixed Scrolling

## 0.5.1

- Replace `marked` by `snarkdown`

## 0.5.0

- Upgrade to React 18

## 0.4.0

- Shuffle among all questions
- Scroll up on next question
- Show result after completing the quiz (without nav)
- Fix code to show correct and incorrect filter correctly on result page
- Enable navigation
- Sdded quiz confirmation and fixed navigation
- Fixed modifying copy of state instead of directly
- Callback option for question submission
- Option to disable synopsis

## 0.3.9

- Added support for choosing number of questions to be used
- Added eslint

## 0.3.8

- Fixed wrong npm version in 0.3.7

## 0.3.7

- Fixed issue #54 - Custom result page is not displayed

## 0.3.6

- Added Segment to quiz config

## 0.3.5

- Fixed issue #48 - Maximum update depth exceeded with onComplete props
- Upgraded react version

## 0.3.4

- Fixed issue #35
- Upgraded several dependencies

## 0.3.3

- Added Picture in Question

## 0.3.2

- Fixed incorrect type and button issues (Ref to #32)

## 0.3.1

- Fixed Button issue introduced by v0.3.0 (Ref to #30)

## 0.3.0

- Added Feature: Multiple answers with multiple correct answers (Refer to #26)
- Added Feature: Quiz Input Validator
- Added Selection Tags
- Introduced fields `answerSelectionType`
- Updated `correctAnswer` to either `String`(Single Selection) or `Array` (Multiple Selection)

## 0.2.8

- Renamed Question.jsx to Core.jsx
- Added Scoring System (Ref to #25)
- Revised Question tag to allow markdown (Ref to #24)

## 0.2.7

- Added Locale for customimzation (Refer to #21)
- Added logic to show incorrect answer users chose in result page (Refer to #22)

## 0.2.6

- Added showInstantFeedback & continueTillCorrect
- Revised font color to the incorrect answer container
- Fixed the incorrect index in the result page

## 0.2.5

- Added showDefaultResult, customResultPage, onComplete

## 0.2.4

- Added CHANGELOG.md
- Added Features to README.md
- Fixed potential security vulnerabilities

## 0.2.3

- Added filter question select tag
- Revised result page
- Revised styles
- Updated README.md for shuffling questions set in v0.2.2

## 0.2.2

- Added messageForCorrectAnswer
- Added messageForIncorrectAnswer
- Added explanation
- Added quizSynopsis
- Revised result page style

## 0.2.1

- Minor Fix

## 0.2.0

- Removed Paper CSS
- Added total number of questions & current question being answered (Refer to issue #3)
- Removed Answer.jsx and Result.jsx
- Added Instant feedback after answering the question
- Allowed to retry until the correct one is selected
- Allowed to review questions at the end

## 0.1.2

- Minor Fix

## 0.1.1

- Minor Fix

## 0.1.0

- Initial version, created by wingkwong
