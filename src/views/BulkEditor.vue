<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-menu-button slot="start" />
        <ion-title>{{ $t("Schedule in bulk") }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <section>
        <ion-card>
          <ion-card-header>
            <ion-card-subtitle class="overline">{{ $t("Product Store") }}</ion-card-subtitle>
            <ion-card-title>{{ $t("Stores") }}</ion-card-title>
          </ion-card-header>
          <ion-list>
            <ion-item>
              <ion-label>Store 1</ion-label>
              <ion-checkbox slot="end" />
            </ion-item>
            <ion-item>
              <ion-label>Store 2</ion-label>
              <ion-checkbox slot="end" />
            </ion-item>
            <ion-item>
              <ion-label>Store 3</ion-label>
              <ion-checkbox slot="end" />
            </ion-item>
          </ion-list>
          
          <ion-card-content>
            {{ $t("A store repesents a company or a unique catalog of products. If your OMS is connected to multiple eCommerce stores sellling different collections of products, you may have multiple Product Stores set up in HotWax Commerce.") }}
          </ion-card-content>
        </ion-card> 
            
        <ion-card>
          <ion-card-header>
            <ion-card-subtitle class="overline">{{ $t("Shop Config") }}</ion-card-subtitle>
            <ion-card-title>{{ $t("eCommerce") }}</ion-card-title>
          </ion-card-header>
          <ion-list>
            <ion-item>
              <ion-label>eCommerce 1</ion-label>
              <ion-checkbox slot="end" />
            </ion-item>
            <ion-item>
              <ion-label>eCommerce 2</ion-label>
              <ion-checkbox slot="end" />
            </ion-item>
            <ion-item>
              <ion-label>eCommerce 3</ion-label>
              <ion-checkbox slot="end" />
            </ion-item>
          </ion-list>
          
          <ion-card-content>
            {{ $t("eCommerce stores are directly connected to one Shop Configs. If your OMS is connected to multiple eCommerce stores selling the same catalog operating as one Company, you may have multiple Shop Configs for the selected Product Store.") }}
          </ion-card-content>
        </ion-card>   
           
        <ion-card>
          <ion-card-header>
            <ion-card-subtitle class="overline">{{ $t("Shop Config") }}</ion-card-subtitle>
            <ion-card-title>{{ $t("Scheduler") }}</ion-card-title>
          </ion-card-header>
          <ion-item>
            <ion-icon slot="start" :icon="timeOutline" />
            <ion-label>{{ $t("Run time") }}</ion-label>
            <ion-label class="ion-text-wrap" @click="() => isOpenGlobal = true" slot="end">{{ $t('Select run time') }}</ion-label>
            <ion-modal class="date-time-modal" :is-open="isOpenGlobal" @didDismiss="() => isOpenGlobal = false">
              <ion-content force-overscroll="false">
                <ion-datetime            
                  show-default-buttons
                  hour-cycle="h12"
                />
              </ion-content>
            </ion-modal>
          </ion-item>
          <ion-item>
            <ion-icon slot="start" :icon="timerOutline" />
            <ion-label>{{ $t("Schedule") }}</ion-label>
            <ion-select interface="popover">
              <ion-select-option>Every 5 minutes</ion-select-option>
            </ion-select>
          </ion-item>
          <ion-card-content>
            description 
          </ion-card-content>
        </ion-card>
      </section>
        
      <ion-button fill="outline">
        <ion-icon slot="start" :icon="addOutline" />
        {{ $t("select jobs") }}
      </ion-button>

      <section>
        <ion-card>
          <ion-item lines="none">
            <ion-label>
              Job enum name
              <p>enum description</p>
            </ion-label>  
          </ion-item>
          <ion-item-divider>
            {{ $t("Parameters") }}
          </ion-item-divider>
          <ion-item>
            <ion-label>{{ $t("Store") }}</ion-label>
            <ion-note slot="end">2 {{ $t("stores selected") }}</ion-note>
          </ion-item>
          <ion-item>
            <ion-label>{{ $t("eCommerce") }}</ion-label>
            <ion-badge color="danger">{{ $t("no eCommerce selected") }}</ion-badge>
          </ion-item>
          <ion-item>
            <ion-label>{{ $t("Run time") }}</ion-label>
            <ion-label class="ion-text-wrap" @click="() => isOpen = true" slot="end">{{ $t('Select run time') }}</ion-label>
            <ion-modal class="date-time-modal" :is-open="isOpen" @didDismiss="() => isOpen = false">
              <ion-content force-overscroll="false">
                <ion-datetime              
                  show-default-buttons
                  hour-cycle="h12"
                />
              </ion-content>
            </ion-modal>
          </ion-item>
          <ion-item>
            <ion-label>{{ $t("Schedule") }}</ion-label>
            <ion-select interface="popover" :placeholder='$t("Bulk schedule")'>
              <ion-select-option value="Every 5 minutes">Every 5 minutes</ion-select-option>
            </ion-select>
          </ion-item>
        </ion-card>
      </section>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button>
          <ion-icon :icon="iceCreamOutline" />
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import {
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCheckbox,
  IonContent,
  IonDatetime,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemDivider,
  IonLabel,
  IonList,
  IonMenuButton,
  IonModal,
  IonNote,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
} from '@ionic/vue';
import { defineComponent } from 'vue';
import { useStore } from 'vuex';
import { addOutline, iceCreamOutline, timeOutline, timerOutline } from 'ionicons/icons';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'InitialLoad',
  components: {
    IonBadge,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCheckbox,
    IonContent,
    IonDatetime,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonItem,
    IonItemDivider,
    IonLabel,
    IonList,
    IonMenuButton,
    IonModal,
    IonNote,
    IonPage,
    IonSelect,
    IonSelectOption,
    IonTitle,
    IonToolbar
  },
  data(){
    return {
      isOpenGlobal: false,
      isOpen: false
    }
  },
  setup() {
    const store = useStore();
    const router = useRouter();

    return {
      addOutline,
      iceCreamOutline,
      store,
      router,
      timeOutline,
      timerOutline
    }
  }
});
</script>

<style scoped>
  section {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    align-items: start;
  }
  
  ion-button {
    margin: var(--spacer-base) var(--spacer-xs);
  }

  ion-modal {
    --width: 290px;
    --height: 440px;
    --border-radius: 8px;
  }
</style>
