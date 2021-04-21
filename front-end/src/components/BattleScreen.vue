<template>
<div v-if="doneLoading">
  <h1>{{enemy.name}}</h1>
  <h3>{{enemy.description}}</h3>
  <h2>{{enemy.type}} Level {{enemy.level}}</h2>
  <button @click="startFight">Fight</button>
  <button @click="reload">Find Another Monster</button>
  <h2>{{result}}</h2>
</div>
</template>


<script>
import axios from 'axios';
export default {
  name: 'BattleScreen',
  data() {
    return {
      monster: null,
      enemy: null,
      result: "",
      doneLoading: false,
    }
  },
  async created() {
    await this.setUpMonsters()
  },
  methods: {
    async setUpMonsters() {
      this.monster = (await axios.get("/api/monster/code/" + this.$root.$data.currentMonster._id, {})).data;
      try {
        const response = await axios.get("/api/monster/", {});

        let monsterList = response.data;
        this.enemy = this.selectMonster(monsterList);
        this.doneLoading = true;
      } catch (error) {
        console.log(error);
      }
    },
    async reload() {
      if (this.result === "Your monster cries it last breath and withers away") {
        return;
      }
      await this.setUpMonsters();
      this.result = "";

    },
    selectMonster(list) {
      //selects a monster from the list, or builds one if no other player monsters are around the same level
      console.log("list")
      console.log(list);
      //filter out monsters own by the user
      let monsterList = list.filter(item => !(item.user === this.$root.$data.currentMonster.user));
      console.log("monster list")
      console.log(monsterList);
      //filter by level
      if (this.monster.type === "Titan") {
        monsterList = monsterList.filter(item => Math.abs(item.level - this.monster.level) < 6);
      }
      else if (this.monster.type === "Space") {
        monsterList = monsterList.filter(item => Math.abs(item.level - this.monster.level) < 5);
      }
      else {
        monsterList = monsterList.filter(item => Math.abs(item.level - this.monster.level) < 4);
      }
      
      //if no monster remain, build and return a monster
      if (monsterList.length === 0  || Math.random() * 100 > 70) {
        return this.buildMonster(this.monster);
      }
      
      return monsterList[Math.floor(Math.random() * monsterList.length)];  //return a random monster from the list

    },
    async startFight() {
      if (this.result != "")
        return;

      //fight was won
      if (this.fightMonsters(this.monster, this.enemy)) {
        this.result = "You Won the Battle!";
        console.log("Victory!");
        if (this.enemy.type === "Titan") {
          try {
            await axios.put('/api/monster/' + this.monster._id, {
              name: this.monster.name,
              description: this.monster.description,
              type: this.monster.type,
              score: (this.monster.score + 3),
              level: this.monster.level + 2,
            });
          } catch (error) {
            console.log(error);
          }
        }
        else if (this.enemy.type === "Space") {
          try {
            await axios.put('/api/monster/' + this.monster._id, {
              name: this.monster.name,
              description: this.monster.description,
              type: this.monster.type,
              score: (this.monster.score + 2),
              level: this.monster.level + 1,
          });
          } catch (error) {
            console.log(error);
          }
        }
        else {
          try {
            await axios.put('/api/monster/' + this.monster._id, {
              name: this.monster.name,
              description: this.monster.description,
              type: this.monster.type,
              score: (this.monster.score + 1),
              level: this.monster.level + 1,
          });
          } catch(error) {
            console.log(error);
          }
        }
      }
      else {
        //the fight has lost
        console.log("Lost");
        if (Math.random() * 100 > 97) {
          //player monster dies
          this.result = "Your monster cries it last breath and withers away";
          try {
            await axios.delete('/api/monster/' + this.monster._id, {});
            this.$root.$data.currentMonster = null;
            this.$router.push('Death');
          } catch (error) {
            console.log(error);
          }
        }
        {
          //player monster survives
          this.result = "You Lost the Battle!";
        }
      }
    },
    fightMonsters(userMonster, enemyMonster) {
      if (this.calculatePower(userMonster, enemyMonster) >= this.calculatePower(enemyMonster, userMonster))
        return true;
      return false;
    },
    calculatePower(current, target) {
      let power = current.level;
      if (current.type === "Titan" && target.type === "Space") {
        for (let i = 0; i < 2; i++) {
          power += Math.floor(Math.random() * 4 + 1);
        }
      }
      else if (current.type === "Space" && target.type === "Ghost") {
        for (let i = 0; i < 1; i++) {
          power += Math.floor(Math.random() * 6 + 1);
        }
      }
      else if (current.type === "Ghost" && target.type === "Titan") {
        for (let i = 0; i < 4; i++) {
          power += Math.floor(Math.random() * 4 + 1);
        }
      }


      if (current.type === "Titan") {
        for (let i = 0; i < 4; i++) {
          power += Math.floor(Math.random() * 4 + 1);
        }
      }
      else if (current.type === "Ghost") {
        for (let i = 0; i < 2; i++) {
          power += Math.floor(Math.random() * 6 + 1);
        }
      }
      else {
        for (let i = 0; i < 1; i++) {
          power += Math.floor(Math.random() * 10 + 1);
        }
      }

      console.log( power + " power for " + current.name);
      return power;
    },
    buildMonster(userMonster) {
      //build a random enemy for the player to fight
      let newEnemy = {
        name: null,
        description: null,
        level: null,
        score: 0,
        type: null,
        user: null,
      };
      let userType = userMonster.type;
      
      //make enemy level
      if (userType === "Titan") {
        newEnemy.level = userMonster.level + (Math.floor(Math.random() * 11) - 5);
      }
      else if (userType === "Space") {
        newEnemy.level = userMonster.level + (Math.floor(Math.random() * 9) - 4);
      }
      else {
        newEnemy.level = userMonster.level + (Math.floor(Math.random() * 7) - 3);
      }

      //select enemy type
      let typeID = Math.floor(Math.random() * 3);
      if (typeID === 0) {
        newEnemy.type = "Titan";
        if (newEnemy.level > 1000) {
          newEnemy.name = "Infinity Titan";
          newEnemy.description = "As ancient as time itself";
        }
        else if (newEnemy.level > 500) {
          newEnemy.name = "Ancient Titan";
          newEnemy.description = "Its as old as rocks";
        }
        else if (newEnemy.level > 250) {
          newEnemy.name = "Rock Titan";
          newEnemy.description = "Its rocks";
        }
        else if (newEnemy.level > 200) {
          newEnemy.name = "Rock Man";
          newEnemy.description = "Rough around the edges";
        }
        else if (newEnemy.level > 150) {
          newEnemy.name = "Student Loans";
          newEnemy.description = "Fun";
        }
        else if (newEnemy.level > 125) {
          newEnemy.name = "Giant of Giants";
          newEnemy.description = "Makes your mom look like ant.";
        }
        else if (newEnemy.level > 100) {
          newEnemy.name = "A big bear";
          newEnemy.description = "Not a brother bear";
        }
        else if (newEnemy.level > 90) {
          newEnemy.name = "Biggest Brain";
          newEnemy.description = "Slaps with facts.";
        }
        else if (newEnemy.level > 80) {
          newEnemy.name = "Your mom";
          newEnemy.description = "Joe Mama";
        }
        else if (newEnemy.level > 70) {
          newEnemy.name = "The Real Mount Everest";
          newEnemy.description = "Gosh you woke the mountain";
        }
        else if (newEnemy.level > 60) {
          newEnemy.name = "Mount Everest";
          newEnemy.description = "Don't attack a mountain";
        }
        else if (newEnemy.level > 50) {
          newEnemy.name = "A Redwood Tree";
          newEnemy.description = "It doesn't swing back, but physics does ";
        }
        else if (newEnemy.level > 40) {
          newEnemy.name = "Orge";
          newEnemy.description = "Don't mess with this swamp";
        }
        else if (newEnemy.level > 30) {
          newEnemy.name = "Giant Marshmellow";
          newEnemy.description = "Stay puffy my friends";
        }
        else if (newEnemy.level > 20) {
          newEnemy.name = "Middle School Football Player";
          newEnemy.description = "Acne and angst";
        }
        else if (newEnemy.level > 10) {
          newEnemy.name = "Pre-Tween";
          newEnemy.description = "Loves hot chocolate and using hashtags";
        }
        else {
          newEnemy.name = "Baby Monkey";
          newEnemy.description = "Googoo Gaagaa you about to get slap up.";
        }
      }
     else if (typeID === 1) {
        //Space monsters
        newEnemy.type = "Space";
        if (newEnemy.level > 1000) {
          newEnemy.name = "Purple dude weilding the fundamental elements of the universe in his hand";
          newEnemy.description = "Snappy and ready wack thee.";
        }
        else if (newEnemy.level > 500) {
          newEnemy.name = "Black Hole Dragon";
          newEnemy.description = "A mysterious unknown anomialy or something.";
        }
        else if (newEnemy.level > 250) {
          newEnemy.name = "A Large Sun";
          newEnemy.description = "Don't kill anymore solar systems. Oh Gosh here we go again";
        }
        else if (newEnemy.level > 200) {
          newEnemy.name = "A Small Sun";
          newEnemy.description = "This is madness, you can't kill a sun";
        }
        else if (newEnemy.level > 150) {
          newEnemy.name = "Large Scale invasion";
          newEnemy.description = "A little overkill";
        }
        else if (newEnemy.level > 125) {
          newEnemy.name = "Small Scale invasion";
          newEnemy.description = "A Specialized task force desigend to destroy all life on earth.";
        }
        else if (newEnemy.level > 100) {
          newEnemy.name = "Flying Saucy Monster";
          newEnemy.description = "Ultra Spicy";
        }
        else if (newEnemy.level > 90) {
          newEnemy.name = "An Astroid";
          newEnemy.description = "Hits like a planet";
        }
        else if (newEnemy.level > 80) {
          newEnemy.name = "Martian with Ray Gun";
          newEnemy.description = "2nd Amendment Enthusiast";
        }
        else if (newEnemy.level > 70) {
          newEnemy.name = "Giant Slime Monster";
          newEnemy.description = "Feed me.";
        }
        else if (newEnemy.level > 60) {
          newEnemy.name = "UFNOOOOoooo";
          newEnemy.description = "What's that in the woods?";
        }
        else if (newEnemy.level > 50) {
          newEnemy.name = "Alien Android";
          newEnemy.description = "Gets great cell service";
        }
        else if (newEnemy.level > 40) {
          newEnemy.name = "Gray Being with Large Round Black Soul less Eyes";
          newEnemy.description = "Eyes are about the size of watermelons.";
        }
        else if (newEnemy.level > 30) {
          newEnemy.name = "Little Green Monster";
          newEnemy.description = "He is pretty nice when you get to know him.";
        }
        else if (newEnemy.level > 20) {
          newEnemy.name = "Billy";
          newEnemy.description = "The one kid from middle school. You remember me.";
        }
        else if (newEnemy.level > 10) {
          newEnemy.name = "Slime Man";
          newEnemy.description = "I'm a little tacky.";
        }
        else {
          newEnemy.name = "Baby Birds";
          newEnemy.description = "Eggs didn't come from earth";
        }
     }
     else {
        //ghost monsters
        newEnemy.type = "Ghost";
        if (newEnemy.level > 1000) {
          newEnemy.name = "Super underlord master dreadnaught of the fire pitts";
          newEnemy.description = "It's getting hot up in here";
        }
        else if (newEnemy.level > 500) {
          newEnemy.name = "Spppooooookkkkkkyyyy Undead Pinecone Pile";
          newEnemy.description = "Spiky and unforgiving.";
        }
        else if (newEnemy.level > 250) {
          newEnemy.name = "Mister Professor Doctor Waiter President Doom";
          newEnemy.description = "My card";
        }
        else if (newEnemy.level > 200) {
          newEnemy.name = "Demi Lich of Not Taking Crap";
          newEnemy.description = "The end is near";
        }
        else if (newEnemy.level > 150) {
          newEnemy.name = "The Entire Work Force of Blockbuster";
          newEnemy.description = "Your overdue fees accumilated.";
        }
        else if (newEnemy.level > 125) {
          newEnemy.name = "Your Worst Nightmare";
          newEnemy.description = "Probably something about spoons";
        }
        else if (newEnemy.level > 100) {
          newEnemy.name = "Lich";
          newEnemy.description = "An undead general that raised an army. It gotta be tough having 32842 kids.";
        }
        else if (newEnemy.level > 90) {
          newEnemy.name = "Scary Glowing Red Eyes";
          newEnemy.description = "OOooo Awww.";
        }
        else if (newEnemy.level > 80) {
          newEnemy.name = "Drungle the ghoul";
          newEnemy.description = "Better not sleep on this ghoul";
        }
        else if (newEnemy.level > 70) {
          newEnemy.name = "Sniper";
          newEnemy.description = "GET DOWN, SNIPER!";
        }
        else if (newEnemy.level > 60) {
          newEnemy.name = "Your great great great great grandmother's ghost";
          newEnemy.description = "She was probably racist";
        }
        else if (newEnemy.level > 50) {
          newEnemy.name = "The fear of being ghosted";
          newEnemy.description = "She isn't responding.";
        }
        else if (newEnemy.level > 40) {
          newEnemy.name = "Leftovers";
          newEnemy.description = "The snack that doesn't give back";
        }
        else if (newEnemy.level > 30) {
          newEnemy.name = "Shadowy figure";
          newEnemy.description = "Spooky unknown entity";
        }
        else if (newEnemy.level > 20) {
          newEnemy.name = "floating eyeball";
          newEnemy.description = "You better WATCH OUT!";
        }
        else if (newEnemy.level > 10) {
          newEnemy.name = "The friendzone";
          newEnemy.description = "you'll never escape!";
        }
        else {
          newEnemy.name = "Mild anxiety";
          newEnemy.description = "You can't see it, but its there";
        }
     }
     newEnemy.user = {
       name: "Wild Monster"
     }
     return newEnemy;
    }
  }
}
</script>