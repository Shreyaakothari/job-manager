<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-menu-button slot="start" />
        <ion-title>{{ $t("Inventory") }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <main>
        <section>
          <ion-card>
            <ion-card-header>
              <ion-card-title>{{ $t("Adjustments") }}</ion-card-title>
            </ion-card-header>
            <ion-item>
              <ion-label class="ion-text-wrap">{{ $t("BOPIS corrections") }}</ion-label>
              <ion-toggle :checked="bopisCorrections" color="secondary" slot="end" @ionChange="updateJob($event['detail'].checked, this.jobEnums['BOPIS_CORRECTION'])" />
            </ion-item>
            <ion-item lines="none">
              <ion-label class="ion-text-wrap">
                <p>{{ $t("When using HotWax BOPIS, Shopify isn't aware of the actual inventory consumed. HotWax will automatically restore inventory automatically reduced by Shopify and deduct inventory from the correct store to maintain inventory accuracy.") }}</p>
              </ion-label>
            </ion-item>
            <ion-item button @click="viewJobConfiguration({ id: 'HARD_SYNC', title: 'Hard sync', status: getJobStatus(jobEnums['HARD_SYNC'])})" detail>
              <ion-label class="ion-text-wrap">{{ $t("Hard sync") }}</ion-label>
              <ion-label slot="end">{{ getTemporalExpression('HARD_SYNC') }}</ion-label>
            </ion-item>
            <ion-item lines="none">
              <ion-label class="ion-text-wrap">
                <p>{{ $t("Performing a hard sync from HotWax Commerce to Shopify is useful for eliminating any discrepencies.") }}</p>
              </ion-label>
            </ion-item>
          </ion-card>
          <MoreJobs v-if="getMoreJobs(jobEnums, enumTypeId).length" :jobs="getMoreJobs(jobEnums, enumTypeId)" />
        </section>

        <aside class="desktop-only" v-if="isDesktop" v-show="currentJob">
          <JobConfiguration :title="title" :status="currentJobStatus" :type="freqType" :key="currentJob"/>
        </aside>
      </main>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToggle,
  IonToolbar,
  isPlatform,
} from '@ionic/vue';
import { defineComponent } from 'vue';
import { mapGetters, useStore } from 'vuex';
import JobConfiguration from '@/components/JobConfiguration.vue'
import { isFutureDate, showToast, prepareRuntime } from '@/utils';
import emitter from '@/event-bus';
import { useRouter } from 'vue-router'
import { translate } from '@/i18n';
import MoreJobs from '@/components/MoreJobs.vue';

export default defineComponent({
  name: 'Inventory',
  components: {
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonContent,
    IonHeader,
    IonItem,
    IonLabel,
    IonMenuButton,
    IonPage,
    IonTitle,
    IonToggle,
    IonToolbar,
    JobConfiguration,
    MoreJobs
  },
  data() {
    return {
      jobEnums: JSON.parse(process.env?.VUE_APP_INV_JOB_ENUMS as string) as any,
      jobFrequencyType: JSON.parse(process.env?.VUE_APP_JOB_FREQUENCY_TYPE as string) as any,
      currentJob: '' as any,
      title: 'Hard sync',
      currentJobStatus: '',
      freqType: '',
      isJobDetailAnimationCompleted: false,
      isDesktop: isPlatform('desktop'),
      enumTypeId: 'INVENTORY_SYS_JOB'
    }
  },
  computed: {
    ...mapGetters({
      getJobStatus: 'job/getJobStatus',
      getJob: 'job/getJob',
      currentShopifyConfig: 'user/getCurrentShopifyConfig',
      currentEComStore: 'user/getCurrentEComStore',
      getTemporalExpr: 'job/getTemporalExpr',
      getMoreJobs: 'job/getMoreJobs'
    }),
    bopisCorrections(): boolean {
      const status = this.getJobStatus(this.jobEnums["BOPIS_CORRECTION"]);
      return status && status !== "SERVICE_DRAFT";
    }
  },
  methods: {
    async updateJob(checked: boolean, id: string, status="EVERY_15_MIN") {
      const job = this.getJob(id);

      // added check that if the job is not present, then display a toast and then return
      if (!job) {
        showToast(translate('Configuration missing'))
        return;
      }

      // TODO: added this condition to not call the api when the value of the select automatically changes
      // need to handle this properly
      if ((checked && job?.status === 'SERVICE_PENDING') || (!checked && job?.status === 'SERVICE_DRAFT')) {
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
        job.runTime = prepareRuntime(job)
        this.store.dispatch('job/scheduleService', job)
      } else if (job?.status === 'SERVICE_PENDING') {
        this.store.dispatch('job/updateJob', job)
      }
    },
    async viewJobConfiguration(jobInformation: any) {
      this.currentJob = jobInformation.job || this.getJob(this.jobEnums[jobInformation.id])
      this.title = jobInformation.title ? jobInformation.title : (jobInformation.job.enumName || jobInformation.job.jobName)
      this.currentJobStatus = jobInformation.status;
      this.freqType = jobInformation.id && this.jobFrequencyType[jobInformation.id]

      await this.store.dispatch('job/updateCurrentJob', { job: this.currentJob });
      if(!this.isDesktop && this.currentJob) {
        this.router.push({name: 'JobDetails', params: { title: this.title, jobId: this.currentJob.jobId, category: "inventory"}});
        return;
      }

      // if job runTime is not a valid date then making runTime as empty
      if (this.currentJob?.runTime && !isFutureDate(this.currentJob?.runTime)) {
        this.currentJob.runTime = ''
      }
      if (this.currentJob && !this.isJobDetailAnimationCompleted) {
        emitter.emit('playAnimation');
        this.isJobDetailAnimationCompleted = true;
      }
    },
    getTemporalExpression(enumId: string) {
      return this.getTemporalExpr(this.getJobStatus(this.jobEnums[enumId]))?.description ?
        this.getTemporalExpr(this.getJobStatus(this.jobEnums[enumId]))?.description :
        this.$t('Disabled')
    },
    fetchJobs(){
      this.store.dispatch("job/fetchJobs", {
        "inputFields":{
          "enumTypeId": "INVENTORY_SYS_JOB"
        }
      });
    }
  },
  mounted () {
    this.fetchJobs();
    emitter.on("productStoreOrConfigChanged", this.fetchJobs);
    emitter.on('viewJobConfiguration', this.viewJobConfiguration)
  },
  unmounted() {
    emitter.off("productStoreOrConfigChanged", this.fetchJobs);
    emitter.off('viewJobConfiguration', this.viewJobConfiguration)
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
