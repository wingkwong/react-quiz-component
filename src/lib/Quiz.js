"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _Question = _interopRequireDefault(require("./Question"));

require("./styles.css");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; return newObj; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Quiz =
/*#__PURE__*/
function (_Component) {
  _inherits(Quiz, _Component);

  function Quiz(props) {
    var _this;

    _classCallCheck(this, Quiz);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Quiz).call(this, props));

    _defineProperty(_assertThisInitialized(_this), "start", function () {
      _this.setState({
        start: true
      });
    });

    _defineProperty(_assertThisInitialized(_this), "shuffleQuestions", function (questions) {
      for (var i = questions.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var _ref = [questions[j], questions[i]];
        questions[i] = _ref[0];
        questions[j] = _ref[1];
      }

      return questions;
    });

    _this.state = {
      start: false
    };
    _this.start = _this.start.bind(_assertThisInitialized(_this));
    return _this;
  }

  _createClass(Quiz, [{
    key: "render",
    value: function render() {
      var _this2 = this;

      var _this$props = this.props,
          quiz = _this$props.quiz,
          shuffle = _this$props.shuffle,
          showDefaultResult = _this$props.showDefaultResult,
          onComplete = _this$props.onComplete,
          customResultPage = _this$props.customResultPage;

      if (!quiz) {
        console.error("Quiz object is required.");
        return null;
      }

      var questions = quiz.questions;

      if (shuffle) {
        questions = this.shuffleQuestions(questions);
      }

      return _react["default"].createElement("div", {
        className: "react-quiz-container"
      }, !this.state.start && _react["default"].createElement("div", null, _react["default"].createElement("h2", null, quiz.quizTitle), _react["default"].createElement("div", null, quiz.questions.length, " Questions"), quiz.quizSynopsis && _react["default"].createElement("div", {
        className: "quiz-synopsis"
      }, quiz.quizSynopsis), _react["default"].createElement("div", {
        className: "startQuizWrapper"
      }, _react["default"].createElement("button", {
        onClick: function onClick() {
          return _this2.start();
        },
        className: "startQuizBtn btn"
      }, "Start Quiz"))), this.state.start && _react["default"].createElement(_Question["default"], {
        questions: questions,
        showDefaultResult: showDefaultResult,
        onComplete: onComplete,
        customResultPage: customResultPage
      }));
    }
  }]);

  return Quiz;
}(_react.Component);

Quiz.propTypes = {
  quiz: _propTypes["default"].object,
  shuffle: _propTypes["default"].bool,
  showDefaultResult: _propTypes["default"].bool,
  onComplete: _propTypes["default"].func,
  customResultPage: _propTypes["default"].func
};
var _default = Quiz;
exports["default"] = _default;