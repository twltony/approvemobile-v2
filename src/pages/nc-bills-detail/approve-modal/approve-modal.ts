import { UserInfo } from './../../../providers/constant/constant';
import {LoginPage} from '../../login/login';
import { NcBillsDetailServiceProvider } from './../../../providers/nc-bills-detail-service/nc-bills-detail-service';
import { URLSearchParams } from '@angular/http';
import { Component } from '@angular/core';
import { ToastController, IonicPage, NavController, NavParams, ViewController, LoadingController } from 'ionic-angular';
import xml2js from 'xml2js';
import { Events } from 'ionic-angular';


@Component({
  selector: 'page-approve-modal',
  templateUrl: 'approve-modal.html',
})
export class ApproveModalPage {

  memo;
  approveState;
  toastMsg;
  rejectType = "1";

  constructor(public navCtrl: NavController,
    public viewCtrl: ViewController,
    public approveService: NcBillsDetailServiceProvider,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    public nav: NavController,
    public events: Events,
    public navParams: NavParams) {
  }

  ionViewDidLoad() {

  }
  ionViewDidEnter() {
    this.approveState = this.navParams.get('approveState');
    
    if (this.approveState == 1) {
      this.memo = "同意"
    }
  }

  submitApprove(approveState) {
    
    if (this.memo) {
      let loading = this.loadingCtrl.create({
        content: '审批提交中。。。'
      });
      loading.present();
      let params = new URLSearchParams();
      params.append("approveState", approveState);
      params.append("approveMemo", this.memo);
      params.append("action", "3");
      params.append("OSystemId",this.navParams.get("systemId"))
      params.append("billId",this.navParams.get('billId'));
      params.append("rejectType", this.rejectType);
      this.approveService.doApprove(params).then(res => {
        let result;
        xml2js.parseString(res.text(), function (err, oresult) {
          result = oresult.response
          //console.log(result);
        })
        if(result.sysMSG[0].tips && result.sysMSG[0].tips[0]=="loginOK"){
          UserInfo.prototype.token = result.sysMSG[0].token;
          let toastok = this.toastCtrl.create({
            message: result.datas ? result.datas[0] : "审批失败，未知原因。",
            position: 'top'
          });
          toastok.present();
          setTimeout(() => { toastok.dismissAll(); }, 3000)
          if(result.datas && result.datas[0] == " 审批成功！" || result.datas[0] == " 驳回成功！" ){
            this.viewCtrl.dismiss(result.datas);
          }
        }else{
          let toastfailed = this.toastCtrl.create({
            message: "审批秘钥超时失效，为了信息安全，请重新登录！",
            position: 'top'
          });
          toastfailed.present();
          setTimeout(() => { toastfailed.dismissAll(); }, 6000)
          setTimeout(() => { this.nav.setRoot(LoginPage);}, 500)
        }
        setTimeout(() => { loading.dismiss(); }, 500)
      }).catch(err => {
        alert("doApprove()@approve-modal.ts =>" + err);
        setTimeout(() => { loading.dismiss(); }, 500)
      });
    }else{
      let toast = this.toastCtrl.create({
        message: "请填写批语，再提交审批！",
        position: 'top'
      });
      toast.present();
      setTimeout(() => { toast.dismissAll(); }, 3000)
      
    }
  }

  dismiss() {
    this.viewCtrl.dismiss();
    this.events.publish('reload:data');
    this.events.publish('dismissDetail');
  }

}
