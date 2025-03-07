<template>
  <ion-menu side="start" content-id="main-content" type="overlay" :disabled="!isUserAuthenticated">
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ $t("Job Manager") }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-list>
        <ion-menu-toggle auto-hide="false" v-for="(page, index) in appPages" :key="index">
          <ion-item
            v-if="page.url"
            button
            @click="selectedIndex = index"
            router-direction="root"
            :router-link="page.url"
            class="hydrated"
            :class="{ selected: selectedIndex === index }">
            <ion-icon slot="start" :ios="page.iosIcon" :md="page.mdIcon" />
            <ion-label>{{ $t(page.title) }}</ion-label>
          </ion-item>
          <ion-item-divider color="light" v-else>
            <ion-label color="medium">{{ $t(page.title) }}</ion-label>
          </ion-item-divider> 
        </ion-menu-toggle>
      </ion-list>
    </ion-content>
    <ion-footer>
      <ion-toolbar>
        <ion-item lines="none">
          <ion-label class="ion-text-wrap">
            <p class="overline">{{ instanceUrl }}</p>
          </ion-label>
          <ion-note slot="end">{{ userProfile?.userTimeZone }}</ion-note>
        </ion-item>
        <!-- showing product stores only when there are multiple options to choose from. -->
        <ion-item v-if="userProfile?.stores?.length > 2" lines="none">
          <ion-select interface="popover" :value="eComStore.productStoreId" @ionChange="setEComStore($event)">
            <ion-select-option v-for="store in (userProfile?.stores ? userProfile.stores : [])" :key="store.productStoreId" :value="store.productStoreId" >{{ store.storeName }}</ion-select-option>
          </ion-select>
        </ion-item>
        <ion-item v-else lines="none">
          <ion-label class="ion-text-wrap">
            {{ currentEComStore.storeName }}
          </ion-label>
        </ion-item>
        <!-- similarly, showing shopify configs only when there are multiple options to choose from 
        but if both product store and config have multiple options, then only option to choose
        product store will be visible -->
        <ion-item v-if="shopifyConfigs.length > 1 && userProfile?.stores.length < 3" lines="none">
          <ion-select interface="popover" :value="currentShopifyConfig?.shopifyConfigId" @ionChange="setShopifyConfig($event)">
            <ion-select-option v-for="shopifyConfig in shopifyConfigs" :key="shopifyConfig.shopifyConfigId" :value="shopifyConfig.shopifyConfigId" >{{ shopifyConfig.name ? shopifyConfig.name : shopifyConfig.shopifyConfigName }}</ion-select-option>
          </ion-select>
        </ion-item>
        <ion-item v-else lines="none">
          <ion-label class="ion-text-wrap">
           <p>{{ currentShopifyConfig.name ? currentShopifyConfig.name : currentShopifyConfig.shopifyConfigName }}</p> 
          </ion-label>
        </ion-item>
      </ion-toolbar>
    </ion-footer>
  </ion-menu>
</template>

<script lang="ts">
import {
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemDivider,
  IonLabel,
  IonList,
  IonMenu,
  IonMenuToggle,
  IonNote,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar
} from "@ionic/vue";
import { defineComponent, ref } from "vue";
import { mapGetters } from "vuex";
import { pulseOutline, calendarNumberOutline, terminalOutline, ticketOutline, albumsOutline, shirtOutline, settings, iceCreamOutline, libraryOutline } from "ionicons/icons";
import { useStore } from "@/store";
import emitter from "@/event-bus"
export default defineComponent({
  name: "Menu",
  components: {
    IonContent,
    IonFooter,
    IonHeader,
    IonIcon,
    IonItem,
    IonItemDivider,
    IonLabel,
    IonList,
    IonMenu,
    IonMenuToggle,
    IonNote,
    IonSelect,
    IonSelectOption,
    IonTitle,
    IonToolbar
  },
  created() {
    // When open any specific screen it should show that screen selected
    this.selectedIndex = this.appPages.findIndex((screen) => {
      return screen.url === this.$router.currentRoute.value.path;
    })
  },
  computed: {
    ...mapGetters({
      isUserAuthenticated: 'user/isUserAuthenticated',
      currentFacility: 'user/getCurrentFacility',
      eComStore: 'user/getCurrentEComStore',
      instanceUrl: 'user/getInstanceUrl',
      userProfile: 'user/getUserProfile',
      currentShopifyConfig: 'user/getCurrentShopifyConfig',
      currentEComStore: 'user/getCurrentEComStore',
      shopifyConfigs: 'user/getShopifyConfigs',
    })
  },
  methods: {
    async setEComStore(event: CustomEvent) {
      await this.store.dispatch('user/setEcomStore', { 'productStoreId': event.detail.value })
      emitter.emit("productStoreOrConfigChanged")
    },
    async setShopifyConfig(event: CustomEvent){
      await this.store.dispatch('user/setCurrentShopifyConfig', { 'shopifyConfigId': event.detail.value });
      emitter.emit("productStoreOrConfigChanged")
    },
  },
  watch:{
    $route (to) {
      // When logout and login it should point to Oth index
      if (to.path === '/login') {
        this.selectedIndex = 0;
      }
    },
  }, 
  setup() {
    const store = useStore();
    const selectedIndex = ref(0);
    let appPages = [
      {
        title: "Pipeline",
        url: "/pipeline",
        iosIcon: pulseOutline,
        mdIcon: pulseOutline,
        dependsOnBaseURL: true
      },
      {
        title: "Initial load",
        url: "/initial-load",
        iosIcon: iceCreamOutline,
        mdIcon: iceCreamOutline,
        dependsOnBaseURL: false
      },
      {
        title: "Pre-order",
        url: "/pre-order",
        iosIcon: calendarNumberOutline,
        mdIcon: calendarNumberOutline,
        dependsOnBaseURL: false
      },
      {
        title: "Orders",
        url: "/orders",
        iosIcon: ticketOutline,
        mdIcon: ticketOutline,
        dependsOnBaseURL: false
      },
      {
        title: "Inventory",
        url: "/inventory",
        iosIcon: albumsOutline,
        mdIcon: albumsOutline,
        dependsOnBaseURL: false
      },
      {
        title: "Products",
        url: "/product",
        iosIcon: shirtOutline,
        mdIcon: shirtOutline,
        dependsOnBaseURL: false
      },
      {
        title: "Miscellaneous",
        url: "/miscellaneous",
        iosIcon: libraryOutline,
        mdIcon: libraryOutline,
        dependsOnBaseURL: false
      },
      /* {
        title: "Bulk editor"
      },
      {
        title: "Schedule in bulk",
        url: "/bulk-editor",
        iosIcon: terminalOutline,
        mdIcon: terminalOutline,
        dependsOnBaseURL: false
      }, */
      {
        title: "Settings",
        url: "/settings",
        iosIcon: settings,
        mdIcon: settings,
        dependsOnBaseURL: true
      },
    ];
    if (process.env.VUE_APP_BASE_URL) {
      appPages = appPages.filter((page) => page.dependsOnBaseURL);
    }
    return {
      selectedIndex,
      appPages,
      pulseOutline, 
      calendarNumberOutline, 
      terminalOutline,
      ticketOutline, 
      albumsOutline, 
      shirtOutline,
      settings,
      iceCreamOutline,
      store,
      libraryOutline
    };
  },
});
</script>

<style scoped>
ion-menu.md ion-item.selected ion-icon {
  color: var(--ion-color-secondary);
}
ion-menu.ios ion-item.selected ion-icon {
  color: var(--ion-color-secondary);
}
ion-item.selected {
  --color: var(--ion-color-secondary);
}
</style>
