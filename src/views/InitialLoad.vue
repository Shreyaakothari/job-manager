<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-menu-button slot="start" />
        <ion-title>{{ $t("Initial load") }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <main>
        <section>
          <ion-card>
            <ion-card-header>
              <ion-card-title>{{ $t("Products") }}</ion-card-title>
            </ion-card-header>
            <ion-button expand="block" fill="outline" @click="viewJobConfiguration('products', jobEnums['IMP_PRDTS_BLK'])">{{ $t("Import products in bulk") }}</ion-button>
            <ion-item lines="none">
              <ion-label class="ion-text-wrap">
                <p>{{ $t("Import all products from Shopify. Make sure you run this before importing orders in bulk during intial setup.") }}</p>
              </ion-label>
            </ion-item>
          </ion-card>

          <ion-card>
            <ion-card-header>
              <ion-card-title>{{ $t("Orders") }}</ion-card-title>
            </ion-card-header>
            <ion-button expand="block" fill="outline" @click="viewJobConfiguration('orders', jobEnums['IMP_ORDERS_BLK'])">{{ $t("Import orders in bulk") }}</ion-button>
            <ion-item lines="none">
              <ion-label class="ion-text-wrap">
                <p>{{ $t("Before importing historical orders in bulk, make sure all products are set up or else order import will not run correctly.") }}</p>
                <br />
                <p>{{ $t("By default only open and unshipped orders will be imported.") }}</p>
              </ion-label>
            </ion-item>
          </ion-card>

          <ion-card>
            <ion-card-header>
              <ion-card-title>{{ $t("Process Uploads") }}</ion-card-title>
            </ion-card-header>
            <ion-item>
              <ion-label class="ion-text-wrap">{{ $t("File upload status") }}</ion-label>
              <ion-toggle :checked="fileStatusUpdateWebhook" color="secondary" slot="end" @ionChange="updateWebhook($event['detail'].checked, 'BULK_OPERATIONS_FINISH')" />
            </ion-item>
            <ion-item>
              <ion-label class="ion-text-wrap">{{ $t("Upload Pending Process") }}</ion-label>
              <ion-checkbox slot="end" :checked="processPendingUploadsOnShopify" @ionChange="updateJob($event['detail'].checked, jobEnums['UL_PRCS'])"/>
            </ion-item>
          </ion-card>
        </section>

        <aside class="desktop-only" v-if="isDesktop" v-show="currentSelectedJobModal">
          <InitialJobConfiguration :type='currentSelectedJobModal' :shopifyOrderId='lastShopifyOrderId' :key="job" />
        </aside>
      </main>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import {
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCheckbox,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToggle,
  IonToolbar,
  isPlatform
} from '@ionic/vue';
import { defineComponent } from 'vue';
import { mapGetters, useStore } from 'vuex';
import { isFutureDate, showToast } from '@/utils';
import emitter from '@/event-bus';
import InitialJobConfiguration from '@/components/InitialJobConfiguration.vue';
import { useRouter } from 'vue-router';
import { translate } from '@/i18n';

export default defineComponent({
  name: 'InitialLoad',
  components: {
    InitialJobConfiguration,
    IonButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCheckbox,
    IonContent,
    IonHeader,
    IonItem,
    IonLabel,
    IonMenuButton,
    IonPage,
    IonTitle,
    IonToggle,
    IonToolbar
  },
  data() {
    return {
      jobEnums: JSON.parse(process.env?.VUE_APP_INITIAL_JOB_ENUMS as string) as any,
      webhookEnums: JSON.parse(process.env?.VUE_APP_WEBHOOK_ENUMS as string) as any,
      currentSelectedJobModal: '',
      job: {} as any,
      lastShopifyOrderId: '',
      isJobDetailAnimationCompleted: false,
      isDesktop: isPlatform('desktop')
    }
  },
  mounted() {
    this.fetchJobs();
    emitter.on("productStoreOrConfigChanged", this.fetchJobs);
  },
  unmounted() {
    emitter.off("productStoreOrConfigChanged", this.fetchJobs);
  },
  computed: {
    ...mapGetters({
      getJobStatus: 'job/getJobStatus',
      getJob: 'job/getJob',
      currentShopifyConfig: 'user/getCurrentShopifyConfig',
      currentEComStore: 'user/getCurrentEComStore',
      getCachedWebhook: 'webhook/getCachedWebhook'
    }),
    fileStatusUpdateWebhook(): boolean {
      const webhookTopic = this.webhookEnums['BULK_OPERATIONS_FINISH']
      return this.getCachedWebhook[webhookTopic]
    },
    processPendingUploadsOnShopify(): boolean {
      const status = this.getJobStatus(this.jobEnums["UL_PRCS"]);
      return status && status !== "SERVICE_DRAFT";
    }
  },
  methods: {
    async updateJob(checked: boolean, id: string, status = 'EVERY_15_MIN') {
      const job = this.getJob(id);

      // TODO: added this condition to not call the api when the value of the select automatically changes
      // need to handle this properly
      if ((checked && job?.status === 'SERVICE_PENDING') || (!checked && job?.status === 'SERVICE_DRAFT')) {
        return;
      }

      // added check that if the job is not present, then display a toast and then return
      if (!job) {
        showToast(translate('Configuration missing'))
        return;
      }

      job['jobStatus'] = status

      // if job runTime is not a valid date then making runTime as empty
      if (job?.runTime && !isFutureDate(job?.runTime)) {
        job.runTime = ''
      }

      if (!checked) {
        this.store.dispatch('job/cancelJob', job)
      } else if (job?.status === 'SERVICE_DRAFT') {
        this.store.dispatch('job/scheduleService', job)
      } else if (job?.status === 'SERVICE_PENDING') {
        this.store.dispatch('job/updateJob', job)
      }
    },
    async viewJobConfiguration(label: string, id: string) {
      this.currentSelectedJobModal = label;
      this.job = this.getJob(id);

      if(this.job?.runtimeData?.sinceId?.length >= 0) {
        this.lastShopifyOrderId = this.job.runtimeData.sinceId !== 'null' ? this.job.runtimeData.sinceId : ''
      }
      // if job runTime is not a valid date then assigning current date to the runTime
      if (this.job?.runTime && !isFutureDate(this.job?.runTime)) {
        this.job.runTime = ''
      }

      await this.store.dispatch('job/updateCurrentJob', { job: this.job });
      if(!this.isDesktop && this.job) {
        this.router.push({name: 'JobDetails', params: { title: this.currentSelectedJobModal, jobId: this.job.jobId, category: "initial-load"}});
        return;
      }

      if (this.job && !this.isJobDetailAnimationCompleted) {
        emitter.emit('playAnimation');
        this.isJobDetailAnimationCompleted = true;
      }
    },
    fetchJobs(){
      this.store.dispatch("job/fetchJobs", {
        "inputFields":{
          "systemJobEnumId": Object.values(this.jobEnums),
          "systemJobEnumId_op": "in"
        }
      })
      this.store.dispatch('webhook/fetchWebhooks')
    },
    async updateWebhook(checked: boolean, enumId: string) {
      const webhook = this.getCachedWebhook[this.webhookEnums[enumId]]

      // TODO: added this condition to not call the api when the value of the select automatically changes
      // need to handle this properly
      if ((checked && webhook) || (!checked && !webhook)) {
        return;
      }

      if (checked) {
        await this.store.dispatch('webhook/subscribeWebhook', enumId)
      } else {
        await this.store.dispatch('webhook/unsubscribeWebhook', { webhookId: webhook?.id, shopifyConfigId: this.currentShopifyConfig.shopifyConfigId })
      }
    }
  },
  setup() {
    const store = useStore();
    const router = useRouter();

    return {
      store,
      router
    }
  }
});
</script>

<style scoped>
ion-card > ion-button {
  margin: var(--spacer-sm);
}
</style>
