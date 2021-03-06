import db from '@/plugins/firebase'
const tf = require("@tensorflow/tfjs");
const fetch = require("node-fetch");

import { functions } from "@/plugins/firebase";

export const state = () => ({
    messages:[],
    time:0,
    msgupdated:false,
    result:[],
    userresult:[]
})

export const getters = {
  getmsgupdate (state) {
    return state.msgupdated;
  },
  getresult(state){
    return state.result;
  },
  getuserresult(state){
    return state.userresult;
  }
}

export const mutations = {
    setSubAns(state,payload){
        state.messages = payload;
    },
    setResult(state,payload){
      state.result = payload;
    },
    setUserResult(state,payload){
      state.userresult = payload;
      console.log("Set User Result:- ",payload);
    },
    fetchTime(state,payload){
      state.time=payload;
      console.log("FetchTime Mutation invoked.",state.time);
    }
  };

export const actions={
  // Fetch Categories
  fetchSubAns({ commit },payload) {
      var master=[];
       db.collection("Result").doc(payload).get().then(async querySnapshot => {
         if (querySnapshot.empty) {
         //this.$router.push('/HelloWorld')
         } else {
           var Result = {};
           var subanswer = {};
           var temp = querySnapshot.data().subans;
           if(temp.length === 0){
                Result["nature"] = "Cannot be determined";
              }else{
                // ML code
                const getMetaData = async () => {
                  const metadata = await fetch("https://storage.googleapis.com/tfjs-models/tfjs/sentiment_cnn_v1/metadata.json")
                  return metadata.json()
                }
              
                const padSequences = (sequences, metadata) => {
                  return sequences.map(seq => {
                    if (seq.length > metadata.max_len) {
                      seq.splice(0, seq.length - metadata.max_len);
                    }
                    if (seq.length < metadata.max_len) {
                      const pad = [];
                      for (let i = 0; i < metadata.max_len - seq.length; ++i) {
                        pad.push(0);
                      }
                      seq = pad.concat(seq);
                    }
                    return seq;
                  });
                }
              
                const loadModel = async () => {
                  const url = `https://storage.googleapis.com/tfjs-models/tfjs/sentiment_cnn_v1/model.json`;
                  const model = await tf.loadLayersModel(url);
                  return model;
                };
              
                const predict = (text, model, metadata) => {
                    const trimmed = text.trim().toLowerCase().replace(/(\.|\,|\!)/g, '').split(' ');
                    const sequence = trimmed.map(word => {
                      const wordIndex = metadata.word_index[word];
                      if (typeof wordIndex === 'undefined') {
                        return 2; //oov_index
                      }
                      return wordIndex + metadata.index_from;
                    });
                    const paddedSequence = padSequences([sequence], metadata);
                    const input = tf.tensor2d(paddedSequence, [1, metadata.max_len]);
                  
                    const predictOut = model.predict(input);
                    const score = predictOut.dataSync()[0];
                    predictOut.dispose();
                    return score;
                  }
                const run = async (text) => {
                  const model = await loadModel(); 
                  const metadata = await getMetaData();
                  let sum = 0;
                  text.forEach(function (prediction) {
                    console.log(` ${prediction}`);
                    let perc = predict(prediction, model, metadata);
                    sum += parseFloat(perc, 10);
                  })
                 var finalscore = sum/text.length;
                  var nature="";
                  if (finalscore > 0.66) {
                      nature = "Goodness"
                  }
                    else if (finalscore > 0.4) {
                      nature = "Passion"
                    }
                    else {
                      nature = "Ignorance"
                    }
                    return nature;
                }
               
                await run(temp).then(result =>{
                  Result["nature"] = result;
                });
             // ML Code ends
            }//end of subans if loop
            Result["score"]= querySnapshot.data().score;
            // subanswer[payload]=Result;
               return db.collection("Result").doc(payload).set(Result)
               .then(()=>{
                 alert("Document got update with Subjective answers");
                 db.collection("users").doc(payload).get().then(async querySnapshot => {
                   console.log("Users UID data:- ",querySnapshot.data());
                   Result["displayName"]=querySnapshot.data().displayName;
                   Result["emailID"]=querySnapshot.data().emailID;
                   return db.collection("users").doc(payload).set(Result)
                  .then(()=>{
                    alert("Users got Updated.");
                   })
                    })
               }).catch(error=>{
                 console.log("Error:- ",error);
               });
         }
       })
  },
  // showResult
  async showResult({commit}){
    db.collection("Result").get().then(async querySnapshot => {
      if (querySnapshot.empty) {
      //this.$router.push('/HelloWorld')
      } else {
        var result = {};
        // await commit("setResult",querySnapshot.data());
        querySnapshot.forEach(function(doc) {
          result[doc.id]=doc.data();
      });
       await commit("setResult",result);
      }
    })
  },
   // Show User Result
   async showUserResult({commit}){
    var user = this.state.users.user; 
    db.collection("users").doc(user.uid).get().then(async querySnapshot => {
      if (querySnapshot.empty) {
      //this.$router.push('/HelloWorld')
      } else {
        console.log("Show user Result:- ",querySnapshot.data());
        var Categories = [];
        Categories.push(querySnapshot.data());
        await commit("setUserResult",Categories);
      }
    });
      //  await commit("setResult",result);
  },
  async fetchTime({commit}){
    db.collection("Question-Paper").doc('time').get().then(async querySnapshot => {
      if (querySnapshot.empty) {
      //this.$router.push('/HelloWorld')
      } else {
        // console.log("Time:- ",querySnapshot.data());
        await commit("fetchTime",querySnapshot.data().time);
      }
    })
  },
  async changeTime({commit},payload){
    var time = {};
    time["time"] = payload;
    await db.collection("Question-Paper").doc('time').set(time).then(()=>{
      state.msgupdated=true;
    });
  },
};  