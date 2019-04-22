"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _marked = _interopRequireDefault(require("marked"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; return newObj; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Question =
/*#__PURE__*/
function (_Component) {
  _inherits(Question, _Component);

  function Question(props) {
    var _this;

    _classCallCheck(this, Question);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Question).call(this, props));

    _defineProperty(_assertThisInitialized(_this), "checkAnswer", function (index, correctAnswer) {
      var _this$state = _this.state,
          correct = _this$state.correct,
          incorrect = _this$state.incorrect,
          currentQuestionIndex = _this$state.currentQuestionIndex;

      if (index == correctAnswer) {
        if (incorrect.indexOf(currentQuestionIndex) < 0 && correct.indexOf(currentQuestionIndex) < 0) {
          correct.push(currentQuestionIndex);
        }

        _this.setState({
          correctAnswer: true,
          incorrectAnswer: false,
          showNextQuestionButton: true,
          correct: correct
        });

        var disabledAll = {
          0: {
            disabled: true
          },
          1: {
            disabled: true
          },
          2: {
            disabled: true
          },
          3: {
            disabled: true
          }
        };

        _this.setState(function (prevState) {
          var buttons = Object.assign({}, prevState.buttons, _objectSpread({}, disabledAll, _defineProperty({}, index - 1, {
            className: index == correctAnswer ? "correct" : ""
          })));
          return {
            buttons: buttons
          };
        });
      } else {
        if (correct.indexOf(currentQuestionIndex) < 0 && incorrect.indexOf(currentQuestionIndex) < 0) {
          incorrect.push(currentQuestionIndex);
        }

        _this.setState({
          incorrectAnswer: true,
          correctAnswer: false,
          incorrect: incorrect
        });

        _this.setState(function (prevState) {
          var buttons = Object.assign({}, prevState.buttons, _defineProperty({}, index - 1, {
            disabled: !prevState.buttons[index - 1]
          }));
          return {
            buttons: buttons
          };
        });
      }
    });

    _defineProperty(_assertThisInitialized(_this), "nextQuestion", function (currentQuestionIndex) {
      var questions = _this.props.questions;
      var initState = {
        incorrectAnswer: false,
        correctAnswer: false,
        showNextQuestionButton: false,
        buttons: {}
      };

      if (currentQuestionIndex + 1 == questions.length) {
        _this.setState(_objectSpread({}, initState, {
          endQuiz: true
        }));
      } else {
        _this.setState(_objectSpread({}, initState, {
          currentQuestionIndex: currentQuestionIndex + 1
        }));
      }
    });

    _defineProperty(_assertThisInitialized(_this), "renderMessageforCorrectAnswer", function (question) {
      var defaultMessage = 'You are correct. Please click Next to continue.';
      return question.messageForCorrectAnswer || defaultMessage;
    });

    _defineProperty(_assertThisInitialized(_this), "renderMessageforIncorrectAnswer", function (question) {
      var defaultMessage = 'Incorrect answer. Please try again.';
      return question.messageForIncorrectAnswer || defaultMessage;
    });

    _defineProperty(_assertThisInitialized(_this), "renderExplanation", function (question, isResultPage) {
      var explanation = question.explanation;

      if (!explanation) {
        return null;
      }

      if (isResultPage) {
        return _react["default"].createElement("div", {
          className: "explaination"
        }, _react["default"].createElement("strong", null, "Explaination: "), explanation);
      }

      return _react["default"].createElement("div", null, _react["default"].createElement("br", null), explanation);
    });

    _defineProperty(_assertThisInitialized(_this), "handleChange", function (event) {
      _this.setState({
        filteredValue: event.target.value
      });
    });

    _defineProperty(_assertThisInitialized(_this), "renderQuizResultFilter", function () {
      return _react["default"].createElement("div", {
        className: "quiz-result-filter"
      }, _react["default"].createElement("select", {
        value: _this.state.filteredValue,
        onChange: _this.handleChange
      }, _react["default"].createElement("option", {
        value: "all"
      }, "All"), _react["default"].createElement("option", {
        value: "correct"
      }, "Correct"), _react["default"].createElement("option", {
        value: "incorrect"
      }, "Incorrect")));
    });

    _defineProperty(_assertThisInitialized(_this), "renderQuizResultQuestions", function () {
      var filteredValue = _this.state.filteredValue;
      var questions = _this.props.questions;

      if (filteredValue != 'all') {
        questions = questions.filter(function (question, index) {
          return _this.state[filteredValue].indexOf(index) != -1;
        });
      }

      return questions.map(function (question, questionIdx) {
        return _react["default"].createElement("div", {
          "class": "result-answer-wrapper",
          key: questionIdx + 1
        }, _react["default"].createElement("h3", null, _react["default"].createElement("span", null, "Q", questionIdx + 1, ": "), _react["default"].createElement("span", {
          dangerouslySetInnerHTML: _this.rawMarkup(question.question)
        })), _react["default"].createElement("div", {
          className: "result-answer"
        }, question.answers.map(function (answer, index) {
          return _react["default"].createElement("div", null, _react["default"].createElement("button", {
            disabled: true,
            className: "answerBtn btn" + (index + 1 == question.correctAnswer ? ' correct' : '')
          }, question.questionType == 'text' && _react["default"].createElement("span", null, answer), question.questionType == 'photo' && _react["default"].createElement("img", {
            src: answer
          })));
        })), _this.renderExplanation(question, true));
      });
    });

    _this.state = {
      incorrectAnswer: false,
      correctAnswer: false,
      showNextQuestionButton: false,
      endQuiz: false,
      currentQuestionIndex: 0,
      buttons: {},
      buttonClasses: {},
      correct: [],
      incorrect: [],
      filteredValue: 'all',
      showDefaultResult: _this.props.showDefaultResult != undefined ? _this.props.showDefaultResult : true,
      onComplete: _this.props.onComplete != undefined ? _this.props.onComplete : null,
      customResultPage: _this.props.customResultPage != undefined ? _this.props.customResultPage : null
    };
    return _this;
  }

  _createClass(Question, [{
    key: "rawMarkup",
    value: function rawMarkup(data) {
      var rawMarkup = (0, _marked["default"])(data, {
        sanitize: true
      });
      return {
        __html: rawMarkup
      };
    }
  }, {
    key: "render",
    value: function render() {
      var _this2 = this;

      var questions = this.props.questions;
      var questionSummary = {
        numberOfQuestions: this.props.questions.length,
        numberOfCorrectAnswers: this.state.correct.length,
        numberOfIncorrectAnswers: this.state.incorrect.length,
        questions: this.props.questions
      };
      var question = questions[this.state.currentQuestionIndex];
      var totalQuestions = questions.length;
      return _react["default"].createElement("div", {
        className: "questionWrapper"
      }, !this.state.endQuiz && _react["default"].createElement("div", {
        className: "questionWrapperBody"
      }, _react["default"].createElement("div", {
        className: "questionModal"
      }, this.state.incorrectAnswer && _react["default"].createElement("div", {
        className: "alert incorrect"
      }, this.renderMessageforIncorrectAnswer(question)), this.state.correctAnswer && _react["default"].createElement("div", {
        className: "alert correct"
      }, this.renderMessageforCorrectAnswer(question), this.renderExplanation(question, false))), _react["default"].createElement("div", {
        className: "quizMeta"
      }, _react["default"].createElement("h5", null, "Question ", this.state.currentQuestionIndex + 1, "/", totalQuestions, ":"), _react["default"].createElement("h5", null, "Correct:", this.state.correct.length, " Wrong: ", this.state.incorrect.length)), _react["default"].createElement("h3", {
        dangerouslySetInnerHTML: this.rawMarkup(question.question)
      }), question.answers.map(function (answer, index) {
        if (_this2.state.buttons[index] != undefined) {
          return _react["default"].createElement("button", {
            key: index,
            disabled: _this2.state.buttons[index].disabled || false,
            className: "".concat(_this2.state.buttons[index].className, " answerBtn btn"),
            onClick: function onClick() {
              return _this2.checkAnswer(index + 1, question.correctAnswer);
            }
          }, question.questionType == 'text' && _react["default"].createElement("span", null, answer), question.questionType == 'photo' && _react["default"].createElement("img", {
            src: answer
          }));
        } else {
          return _react["default"].createElement("button", {
            key: index,
            onClick: function onClick() {
              return _this2.checkAnswer(index + 1, question.correctAnswer);
            },
            className: "answerBtn btn"
          }, question.questionType == 'text' && answer, question.questionType == 'photo' && _react["default"].createElement("img", {
            src: answer
          }));
        }
      }), this.state.showNextQuestionButton && _react["default"].createElement("div", {
        className: "nextQuestionBtnDiv"
      }, _react["default"].createElement("button", {
        onClick: function onClick() {
          return _this2.nextQuestion(_this2.state.currentQuestionIndex);
        },
        className: "nextQuestionBtn btn"
      }, "Next"))), this.state.endQuiz && this.state.showDefaultResult && this.state.customResultPage == null && _react["default"].createElement("div", {
        className: "card-body"
      }, _react["default"].createElement("h2", null, "You have completed the quiz. You got ", this.state.correct.length, " out of ", questions.length, " questions. ", _react["default"].createElement("br", null)), this.renderQuizResultFilter(), this.renderQuizResultQuestions()), this.state.endQuiz && this.state.onComplete != undefined && this.state.onComplete(questionSummary), this.state.endQuiz && !this.state.showDefaultResult && this.state.customResultPage != undefined && this.state.customResultPage(questionSummary));
    }
  }]);

  return Question;
}(_react.Component);

Question.propTypes = {
  questions: _propTypes["default"].array,
  showDefaultResult: _propTypes["default"].bool,
  onComplete: _propTypes["default"].func,
  customResultPage: _propTypes["default"].func
};
var _default = Question;
exports["default"] = _default;