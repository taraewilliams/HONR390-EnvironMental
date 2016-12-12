var app = angular.module('EnvironMental', [
    'ngRoute',
    'ngResource'
]);

app.controller('HomeController', function ($scope, $sce)
{
  $scope.day = 1;
  $scope.maxDays = 5;
  $scope.currentQuestion = 0;
  $scope.questionsPerDay = 3;
  $scope.money = 5000;
  $scope.selectedQuestion = {};
  $scope.selectedResponse = "";
  $scope.result = "";
  $scope.errorMessage = "";

  function init(){
    $scope.displayScreen = "welcome";

    $scope.scores = addScorePoints();
    $scope.scores = addMoneyPoints();

    $scope.questions = getQuestions();
    $scope.selectedQuestion = selectQuestion();
    $scope.currentQuestion += 1;
  }

  $scope.chooseDisplayScreen = function(screen){
      $scope.displayScreen = screen;
  };

  $scope.chooseOption = function(option)
  {
      var tempMoney = angular.copy($scope.money) + option.money;
      if(tempMoney < 0){
          $scope.errorMessage = "Oops! You don't have enough money for that. Choose another option.";
          $scope.chooseDisplayScreen('play_game');
      }
      else{
          $scope.errorMessage = "";
          $scope.scores.environmental = updateScore($scope.scores.environmental, option.environmental);
          $scope.scores.social = updateScore($scope.scores.social, option.social);
          $scope.scores.economic = updateScore($scope.scores.economic, option.economic);

          $scope.money = angular.copy(tempMoney);
          $scope.scores.money = updateMoney($scope.scores.money, $scope.money);

          $scope.selectedResponse = option.response;
          $scope.chooseDisplayScreen('response');
      }
  };

  $scope.goToNext = function(){
      $scope.chooseDisplayScreen('play_game');
      $scope.scores.environmental = updateFromLastTurn($scope.scores.environmental);
      $scope.scores.social = updateFromLastTurn($scope.scores.social);
      $scope.scores.economic = updateFromLastTurn($scope.scores.economic);

      if($scope.scores.economic.length <= 0 || $scope.scores.social.length <= 0 || $scope.scores.environmental.length <= 0){
          $scope.chooseDisplayScreen("game_over");
          $scope.result = "<p>Oh no! You let one of your three legs collapse. <br>The city can no longer keep going. Next time, try to balance out the three legs better.</p>";
      }

      $scope.selectedQuestion = selectQuestion();

      if($scope.currentQuestion != $scope.questionsPerDay){
          $scope.currentQuestion += 1;
      }else{
          $scope.currentQuestion = 1;
          $scope.day += 1;

      if($scope.day > $scope.maxDays){
          $scope.chooseDisplayScreen("game_over");
          var environmental = $scope.scores.environmental.length;
          var economic = $scope.scores.economic.length;
          var social = $scope.scores.social.length;
          var total = Math.round((environmental + economic + social)/3);
          var level = getLevel(total);
          $scope.result = "<p>Level: <strong style="font-size:20px;">" + level  + "</strong><br>Environmental: " + environmental + " points<br>Social: " + social + " points<br>Economic: " + economic+ " points<br>Total: " + total + " points</p>";                  }
      }
  };

  var updateScore = function(score, point)
  {
      if(point <= -1){
          var stopIndex = score.length - 1 - Math.abs(point);
          if (stopIndex <= -1){
              stopIndex = -1;
          }
          var index = score.length - 1;

          tempScores = angular.copy(score);
          while (index > stopIndex){
              tempScores[index].color = "red";
              index -= 1;
          }
          score = tempScores;

      }else if(point >= 1){
          for(var i = 0; i < point; i++){
              greenPoint = {
                  value:1,
                  color:"greenyellow"
              };
              score.push(greenPoint);
          }
      }
      return score;
  };

  var updateFromLastTurn = function(score)
  {
      for(var i = 0; i < score.length; i++){
          if (score[i].color == "red"){
              score.splice(i, 1);
              i--;
          }
          else if (score[i].color == "greenyellow"){
              score[i].color = "cyan";
          }
      }
      return score;
  };

  var updateMoney = function(moneyScore, money)
  {
      var moneyPoint = {
          value:1,
          color:"#7CFC00"
      };

      var moneyPoints = Math.round( money / 1000 );

      if (moneyPoints > moneyScore.length){
          for(var i = moneyScore.length; i < moneyPoints; i++){
              moneyScore.push(moneyPoint);
          }
      }else if (moneyPoints < moneyScore.length){
          var removeMoney = moneyScore.length - moneyPoints;
          for(var j = 0; j < removeMoney; j++){
              moneyScore.splice(j, 1);
          }
      }
      return moneyScore;
  };

  var selectQuestion = function(){
      var index = Math.floor(Math.random()*$scope.questions.length);
      $scope.selectedQuestion = angular.copy($scope.questions[index]);
      $scope.questions.splice(index, 1);
      return $scope.selectedQuestion;
  };

  var getLevel = function(totalScore){
      if(totalScore >= 25){
          return "Master";
      }else if (totalScore >= 20){
          return "Specialist"
      }else if (totalScore >= 15){
          return "Apprentice";
      }else if (totalScore >= 10){
          return "Intermediate";
      }else{
          return "Beginner";
      }
  }

  $scope.toTrustedHTML = function(html){
    return $sce.trustAsHtml(html);
  }

  $scope.resetGame = function(){
    $scope.chooseDisplayScreen('welcome');
    $scope.day = 1;
    $scope.currentQuestion = 0;
    $scope.money = 5000;
    $scope.selectedQuestion = {};
    $scope.selectedResponse = "";

    $scope.scores = addScorePoints();
    $scope.scores = addMoneyPoints();

    $scope.questions = getQuestions();
    $scope.selectedQuestion = selectQuestion();
    $scope.currentQuestion += 1;
  };

  var addScorePoints = function(){
      var point = {
          value:1,
          color:"cyan"
      };
      $scope.scores = {
        environmental:[angular.copy(point), angular.copy(point), angular.copy(point), angular.copy(point), angular.copy(point)],
        social:[angular.copy(point), angular.copy(point), angular.copy(point), angular.copy(point), angular.copy(point)],
        economic:[angular.copy(point), angular.copy(point), angular.copy(point), angular.copy(point), angular.copy(point)],
        money:[]
      };
      return $scope.scores;
  };

  var addMoneyPoints = function(){
      var moneyPoint = {
          value:1,
          color:"#7CFC00"
      };
      var moneyPoints = Math.round( $scope.money / 1000 );
      for(var i = 0; i < moneyPoints; i++){
          $scope.scores.money.push(moneyPoint);
      }
      return $scope.scores;
  };

  var getQuestions = function(){
    return [
      {
        text:"A local factory owner wants to build a new pipeline in the town. It might pollute the local river, and the locals seem not to be happy about it. Fund the pipeline? Cost: $1000",
        options:[
          {
            text:"Yes",
            environmental:-4,
            social:-2,
            economic:3,
            response:"<p>The people of the town weren't happy with the pipeline. The factory's business is running much more smoothly now, however. <br>-4 environmental, <br>-2 social, <br>+3 economic</p>",
            money:-1000
          },
          {
            text:"No",
            environmental:3,
            social:2,
            economic:-2,
            response:"<p>The people of the town were happy that their clean water was preserved. The town lost some business because of the extra cost of running the factory. <br>+3 environmental, <br>+2 social, <br>-2 economic</p>",
            money:0
          }
        ],
      },
      {
        text:"The community is having a local river cleanup day. There's a $15 fee to participate. What do you want to do?",
        options:[
          {
            text:"Go help with the cleanup.",
            environmental:2,
            social:2,
            economic:0,
            response:"<p>You helped with the river cleanup and met some new friends. Everyone had a lot of fun! <br>+2 environmental, <br>+2 social, <br>+0 economic</p>",
            money:-15,
          },
          {
            text:"Stay at home and play video games.",
            environmental:0,
            social:-2,
            economic:0,
            response:"<p>You stayed at home and played some fun games. <br>+0 environmental, <br>-2 social, <br>+0 economic</p>",
            money:0
          },
          {
            text:"Tell people at school about the cleanup, but maybe not go yourself.",
            environmental:1,
            social:1,
            economic:0,
            response:"<p>Telling people about the cleanup helped get others involved. Several kids at school went to the cleanup. <br>+1 environmental, <br>+1 social, <br>+0 economic</p>",
            money:0
          }
        ],
      },
      {
        text:"Uh oh! There's a lot of blue-green algae growing in the local river, and it can be harmful to humans. How will you help reduce the amount of blue-green algae?",
        options:[
          {
            text:"Make sure to clean up after pets, like dogs or cats, when they use the bathroom outside.",
            environmental:3,
            social:2,
            economic:0,
            response:"<p>You cleaned up after your pets, and you talked to your friends and told them to do the same. Blue-green algae is starting to reduce in the river. <br>+3 environmental, <br>+2 social, <br>+0 economic</p>",
            money:0
          },
          {
            text:"Leave my grass clippings on the lawn to keep the soil from washing away.",
            environmental:-3,
            social:-1,
            economic:0,
            response:"<p>The grass clippings washed into the river and caused more pollution. <br>-3 environmental, <br>-1 social, <br>+0 economic</p>",
            money:0
          },
          {
            text:"Nothing, because one person can't be doing that much damage.",
            environmental:-4,
            social:-2,
            economic:0,
            response:"<p>No one decided to act on the blue-green algae problem, so it continues to get worse. People aren't happy about not being able to use the river. <br>-4 environmental, <br>-2 social, <br>+0 economic</p>",
            money:0
          }
        ],
      },
      {
        text:"Your friend Jenny is having a bake sale. She wants you to buy some cookies! How much will you spend on cookies?",
        options:[
          {
            text:"$0",
            environmental:0,
            social:-2,
            economic:0,
            response:"<p>Jenny is disappointed you didn't buy any cookies. <br>+0 environmental, <br>-2 social, <br>+0 economic</p>",
            money:0
          },
          {
            text:"$10",
            environmental:0,
            social:2,
            economic:1,
            response:"<p>Jenny is happy you helped her bake sale. <br>+0 environmental, <br>+2 social, <br>+1 economic</p>",
            money:-10
          },
          {
            text:"$20",
            environmental:0,
            social:3,
            economic:2,
            response:"<p>Jenny is really happy you helped support her bake sale! <br>+0 environmental, <br>+3 social, <br>+2 economic</p>",
            money:-20
          }
        ],
      },
      {
        text:"Mr. Jones wants to build a new gymnasium for everyone to use. It will cost $1,500, but it will bring more business to the town. Do you want to build the gymnasium?",
        options:[
          {
            text:"Yes",
            environmental:-5,
            social:2,
            economic:4,
            response:"<p>Everyone was happy to have the new gymnasium built. Now everyone has a place to walk and play basketball.<br>-5 environmental, <br>+2 social, <br>+4 economic</p>",
            money:-1500
          },
          {
            text:"No",
            environmental:3,
            social:-1,
            economic:-2,
            response:"<p>The gymnasium wasn't built, and everyone still has to use the school to exercise. The land it would have been built on was one of the few forests in the area, however. <br>+3 environmental, <br>-1 social, <br>-2 economic</p>",
            money:0
          }
        ],
      },
      {
        text:"Uh oh! There's lead in the town's water supply because of old, rusty pipes. Replacing the pipes will cost $2000. What will you do?",
        options:[
          {
            text:"Replace the pipes.",
            environmental:5,
            social:5,
            economic:-3,
            response:"<p>The townspeople are happy to have clean water again. <br>+5 environmental, <br>+5 social, <br>-3 economic</p>",
            money:-2000
          },
          {
            text:"Leave the pipes for now, but come up with a five-year plan to fix them.",
            environmental:-2,
            social:2,
            economic:1,
            response:"<p>People are upset about the rusty pipes, but they're willing to wait a short while for it to be fixed. <br>-2 environmental, <br>+2 social, <br>+1 economic</p>",
            money:0
          },
          {
            text:"Nothing.",
            environmental:-4,
            social:-3,
            economic:0,
            response:"<p>People are angry that nothing is being done about the rusty pipes. <br>-4 environmental, <br>-3 social, <br>+0 economic</p>",
            money:0
          }
        ],
      },
      {
        text:"Your mom wants you to rake the yard.",
        options:[
          {
            text:"Don't rake the yard. Nature is scary.",
            environmental:-3,
            social:-2,
            economic:0,
            response:"<p>Your mom grounded you for not doing your chores, and the leaves from the yard clogged the storm drain. <br>-3 environmental, <br>-2 social, <br>+0 economic</p>",
            money:0
          },
          {
            text:"Rake the yard. You love your mom.",
            environmental:3,
            social:2,
            economic:0,
            response:"<p>You raked the yard, and your mom gave you $15 as a treat! <br>+3 environmental, <br>+2 social, <br>+0 economic</p>",
            money:15
          }
        ],
      },
      {
        text:"Your family is going camping this weekend, and you want to swim in the river, but the park rangers say it's too polluted. What will you do?",
        options:[
          {
            text:"Swim in the river anyway.",
            environmental:-2,
            social:-2,
            economic:0,
            response:"<p>You got sick from swimming in the river. <br>-2 environmental, <br>-2 social, <br>+0 economic</p>",
            money:0,
          },
          {
            text:"Ask the park rangers how you can help clean up the river.",
            environmental:2,
            social:2,
            economic:0,
            response:"<p>You stayed at home and played some fun games. <br>+2 environmental, <br>+2 social, <br>+0 economic</p>",
            money:0
          },
          {
            text:"Don't swim in the river.",
            environmental:-2,
            social:1,
            economic:0,
            response:"<p>You didn't swim in the river, and you had a fun weekend camping. <br>-2 environmental, <br>+1 social, <br>+0 economic</p>",
            money:0
          }
        ],
      },
      {
        text:"Your dog Baxter ran away! How will you find him?",
        options:[
          {
            text:"Put up posters around town and hope someone will find him.",
            environmental:0,
            social:3,
            economic:0,
            response:"<p>Someone saw Baxter on your poster and brought him home! <br>+0 environmental, <br>+3 social, <br>+0 economic</p>",
            money:0
          },
          {
            text:"Ask your parents to help you go out looking for him.",
            environmental:0,
            social:4,
            economic:0,
            response:"<p>You and your parents found Baxter at the neighbor's house. <br>+0 environmental, <br>+4 social, <br>+0 economic</p>",
            money:0
          },
          {
            text:"Wait for Baxter to come home.",
            environmental:0,
            social:-3,
            economic:0,
            response:"<p>Baxter hasn't come home yet, but you know he will! <br>+0 environmental, <br>-3 social, <br>+0 economic</p>",
            money:0
          }
        ],
      },
      {
        text:"A friend is having a birthday party in the local park. You go, but you notice trash left after the party. What do you do?",
        options:[
          {
            text:"Clean up the trash with your friends.",
            environmental:3,
            social:3,
            economic:0,
            response:"<p>You and your friends make the park beautiful again. <br>+3 environmental, <br>+3 social, <br>+0 economic</p>",
            money:0
          },
          {
            text:"Leave the trash, since someone else will get it.",
            environmental:-3,
            social:-1,
            economic:0,
            response:"<p>You leave the trash and hope someone else cleans it up. <br>-3 environmental, <br>-1 social, <br>+0 economic</p>",
            money:0
          },
          {
            text:"Add some more trash to the pile to make sure it's noticeable.",
            environmental:-5,
            social:-3,
            economic:0,
            response:"<p>Nobody noticed the trash left at the park, and it stayed there. <br>-5 environmental, <br>-3 social, <br>+0 economic</p>",
            money:0
          }
        ],
      },
      {
        text:"Your uncle wants you to go fishing, but your friends say the river is polluted. What do you do?",
        options:[
          {
            text:"Make sure you know which fish are dangerous to eat.",
            environmental:3,
            social:3,
            economic:0,
            response:"<p>Your and your uncle had a fun time fishing! <br>+3 environmental, <br>+3 social, <br>+0 economic</p>",
            money:0
          },
          {
            text:"Tell your uncle you aren't going.",
            environmental:2,
            social:-2,
            economic:0,
            response:"<p>Your uncle was disappointed that you didn't go. <br>+2 environmental, <br>-2 social, <br>+0 economic</p>",
            money:0
          },
          {
            text:"Tell your friends they're being silly, and go anyway.",
            environmental:-2,
            social:1,
            economic:0,
            response:"<p>You and your uncle went fishing, but some of the fish you caught weren't safe to eat. <br>-2 environmental, <br>+1 social, <br>+0 economic</p>",
            money:0
          }
        ],
      },
      {
        text:"A company is willing to pay $5000 to build a new supermarket in the middle of a forest outside of town. If they build there, they'll cut down all the trees. Let them build the supermarket?",
        options:[
          {
            text:"Yes",
            environmental:-5,
            social:-3,
            economic:4,
            response:"<p>The people in town were sad to see the forest destroyed. <br>-5 environmental, <br>-3 social, <br>+5 economic</p>",
            money:5000
          },
          {
            text:"No",
            environmental:5,
            social:3,
            economic:-5,
            response:"<p>The new supermarket would have brought more businesses to the town, but the forest is saved. <br>+5 environmental, <br>+3 social, <br>-5 economic</p>",
            money:0
          }
        ],
      },
      {
        text:"While playing near your house, you spot a stray cat. What do you do?",
        options:[
          {
            text:"Call the animal shelter to pick it up.",
            environmental:2,
            social:2,
            economic:0,
            response:"<p>The animal shelter picked up the cat and found its owner! It was a happy reunion. <br>+2 environmental, <br>+2 social, <br>+0 economic</p>",
            money:0
          },
          {
            text:"Run away, since you're allergic to cats.",
            environmental:0,
            social:-1,
            economic:0,
            response:"<p>Really, you don't much like cats. <br>+0 environmental, <br>-1 social, <br>+0 economic</p>",
            money:0
          },
          {
            text:"Pick it up and take it home.",
            environmental:2,
            social:-1,
            economic:0,
            response:"<p>It turned out the cat had an owner who came looking for it. Mr. Whiskers went home with his owner, and you were sad. <br>+2 environmental, <br>-1 social, <br>+0 economic</p>",
            money:0
          }
        ],
      },
      {
        text:"You've saved up $200 in allowance money, and you're ready to spend it! What will you spend it on?",
        options:[
          {
            text:"A new, state-of-the-art video game.",
            environmental:0,
            social:2,
            economic:3,
            response:"<p>You had fun playing the game for hours. <br>+0 environmental, <br>+2 social, <br>+3 economic</p>",
            money:-200
          },
          {
            text:"A new pet!",
            environmental:-2,
            social:2,
            economic:3,
            response:"<p>You had fun playing with your new pet! <br>-2 environmental, <br>+2 social, <br>+3 economic</p>",
            money:-200
          },
          {
            text:"Lots of books.",
            environmental:0,
            social:1,
            economic:3,
            response:"<p>You spent hours and hours reading your new books. <br>+0 environmental, <br>+1 social, <br>+3 economic</p>",
            money:-200
          }
        ],
      },
      {
        text:"You have a test tomorrow at school. What do you want to do this evening?",
        options:[
          {
            text:"Play video games.",
            environmental:0,
            social:-2,
            economic:0,
            response:"<p>You played video games all night and failed the test.<br>+0 environmental, <br>-2 social, <br>+0 economic</p>",
            money:0
          },
          {
            text:"Study for the test.",
            environmental:0,
            social:3,
            economic:0,
            response:"<p>You studied hard for the test and got an A+.<br>+0 environmental, <br>+3 social, <br>+0 economic</p>",
            money:0
          },
          {
            text:"Study a little, then play video games.",
            environmental:0,
            social:-1,
            economic:0,
            response:"<p>You studied enough, and you got a B on the test.<br>+0 environmental, <br>-1 social, <br>+0 economic</p>",
            money:0
          }
        ],
      }
    ];
  };


  init();

});
