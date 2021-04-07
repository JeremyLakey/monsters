<template>
  <div>
    <div class="list_monster">
      <h2></h2>
      <div v-for="monster in myMonsters" :key="monster._id">
	<h3>{{monster.name}} Level:{{monster.level}} Type:{{monster.type}} Score:{{monster.score}}</h3>
	<button @click="addScore(monster)">Add Score</button>
        <button @click="addLevel(monster)">Add Level</button>
        <button @click="deleteMonster(monster)">Delete</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  name: 'MonsterList',
  data() { return {
    myMonsters:[]
  } },
  created() {
    this.loadMonsters()
  },
  methods: {
    async loadMonsters() {
      try {
        let response = await axios.get('/api/monster/' + this.$root.$data.user._id, {});
        this.myMonsters = response.data;
      } catch (error) {
        console.log(error);
      }
    },
    async addScore(monster) {
      try {
        await axios.put('/api/monster/update/' + monster._id, {
          name: monster.name,
          description: monster.description,
          type: monster.type,
          score: (monster.score + 1),
          level: monster.level,
        });
        await this.loadMonsters();
      } catch (error) {
        console.log(error);
      }
    },
    async addLevel(monster) {
      try {
        await axios.put('/api/monster/update/' + monster._id, {
          name: monster.name,
          description: monster.description,
          type: monster.type,
          score: monster.score,
          level: monster.level + 1,
        });
        await this.loadMonsters();
      } catch (error) {
        console.log(error);
      }
    },
    async deleteMonster(monster) {
      try {
        await axios.delete('/api/monster/' + monster._id, {});
        await this.loadMonsters();
      } catch (error) {
        console.log(error);
      }
    },
  },
}
</script>


<style>
button {
  margin: 5px;
}
</style>

