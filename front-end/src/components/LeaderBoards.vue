<template>
  <div>
    <div class="board_user">
	<h2>Top Players</h2>
	<div v-for="user in bestUsers" :key="user._id">
          <h3>{{user.name}}</h3>  <h4>High Score: {{user.record}}</h4>
        </div>
    </div>
    <div class="board_monster">
      <h2>Top Monsters</h2>
      <div v-for="monster in bestMonsters" :key="monster._id">
	<h3>{{monster.name}}</h3><h4>Type:{{monster.type}} Score:{{monster.score}}</h4>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  name: 'LeaderBoards',
  data() { return {
    bestUsers:[],
    bestMonsters:[]
  } },
  created() {
    this.loadUsers()
    this.loadMonsters()
  },
  methods: {
    async loadUsers() {
	try {
          let response = await axios.get('/api/user', {});
          let userList = response.data;
          if (!(userList.length > 0))
            return; 
          let temp = [userList[0]];
      
          for (let i = 1; i < userList.length; i++) {
            for (let j = 0; j < temp.length; j++) {
              if (userList[i].record > temp[j].record) {
		temp.splice(j, 0, userList[i]);
		break;
              }
              if (!(j + 1 < temp.length)) {
                temp.push(userList[i]);
                break;
              }
             }
          }
          this.bestUsers = temp.slice(0, 10);
        } catch (error) {
          console.log(error);
        }
    },
    async loadMonsters() {
      try {
        let response = await axios.get('/api/monster', {});
        let userList = response.data;
        console.log(userList);
        if (!(userList.length > 0))
          return; 
        let temp = [userList[0]];
      
        for (let i = 1; i < userList.length; i++) {
          for (let j = 0; j < temp.length; j++) {
            if (userList[i].score > temp[j].score) {
		temp.splice(j, 0, userList[i]);
		break;
            }
            if (!(j + 1 < temp.length)) {
                temp.push(userList[i]);
                break;
              }
          }
        }
        console.log(temp);
        this.bestMonsters = temp.slice(0, 25);
      } catch (error) {
        console.log(error);
      }
    },
  },
  watch: {
    bestMonster() {
      console.log(this.bestMonster);
    }
  },
}
</script>

