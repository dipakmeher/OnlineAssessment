<template>
  <v-app id="inspire">
    <v-main>
      <v-container class="fill-height" fluid>
        <v-row align="center" justify="center">
          <v-col cols="12" sm="8" md="4">
            <v-card class="elevation-12">
              <v-toolbar color="primary darken-2" dark flat>
                <v-toolbar-title>Signup form</v-toolbar-title> </v-toolbar>
              <v-card-text>
                <v-form @submit.prevent="login" @submit.enter="login">
                  <v-text-field
                    v-model="account.name"
                      type="text"
                      class="form-control"
                      placeholder="Your Name"
                      prepend-icon="label"
                  ></v-text-field>

                  <v-text-field
                    v-model="account.email"
                      id="nuxtfire-email"
                      type="email"
                      class="form-control"
                      placeholder="E-mail address"
                      prepend-icon="person"
                  ></v-text-field>
                  <v-text-field
                    v-model="account.password"
                      id="nuxtfire-password"
                      type="password"
                      class="form-control"
                      placeholder="Password"
                      prepend-icon="lock"
                  ></v-text-field> 
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer />
                <v-btn  @click="signup" type="submit" class="btn btn-primary primary darken-2"  color="primary" style="width:100%;" id="login">Signup & Login</v-btn>
                </v-card-actions>
                <v-card-actions >
                  <v-alert  v-if="isError" type="error" class="alert alert-danger">
                    <p class="mb-0">{{ errMsg }}</p>
                  </v-alert>
                  <v-alert  v-if="isSuccess" type="success" class="alert alert-danger">
                    <p class="mb-0">Successfully SignUp</p>
                  </v-alert>
                </v-card-actions>    
              <v-card-text class="text-center"> Want to Login?<nuxt-link to="/" id="signup">Login</nuxt-link></v-card-text> 
            </v-card>
            <div>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
export default {
  data: () => ({
    account: {
      name:"",
      email: "",
      password: ""
    },
    isError: false,
    isSuccess: false,
    errMsg: "",
    successMsg:""
  }),
  methods: {
    signup(e) {
      e.preventDefault();
      // TODO: add parsing of data.
      this.$store
        .dispatch("users/signup", this.account)
        .then(() => {
          this.isSuccess = true;
          // this.successMsg="SignUp Successful";
          setTimeout(() => {
            this.isSuccess = false;
          }, 5000);
          this.$store.dispatch("users/fbsignup", this.account)
        })
        .catch(error => {
          this.isError = true;
          this.errMsg = error.code;
          setTimeout(() => {
            this.isError = false;
          }, 5000);
        });

        
    }
  }
};

</script>
<style scoped>  
.alert{
  width:100%;
}
</style>