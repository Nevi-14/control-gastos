import { Component, OnInit, ViewChild } from '@angular/core';
import { NuevoGastoSinAnticipoPage } from '../nuevo-gasto-sin-anticipo/nuevo-gasto-sin-anticipo.page';
import { NuevoGastoAnticipoPage } from '../nuevo-gasto-anticipo/nuevo-gasto-anticipo.page';
import { GestionGastosPage } from '../gestion-gastos/gestion-gastos.page';
import { MisGastosPage } from '../mis-gastos/mis-gastos.page';
import { MostrarGastosPage } from '../mostrar-gastos/mostrar-gastos.page';
import { InformacionPage } from '../informacion/informacion.page';
import { OpcionesPage } from '../opciones/opciones.page';
import { ListaAnticiposPage } from '../lista-anticipos/lista-anticipos.page';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { AlertController, ModalController, PopoverController } from '@ionic/angular';
import { AlertasService } from 'src/app/services/alertas.service';
import { AnticiposService } from 'src/app/services/anticipos.service';
import { Router } from '@angular/router';
import { TiposGastosService } from 'src/app/services/tipos-gastos.service';
import { ControlGastosService } from 'src/app/services/control-gastos.service';
import { GastoConAnticipo } from 'src/app/models/gastoConAnticipo';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import DatalabelsPlugin from 'chartjs-plugin-datalabels';
import { BaseChartDirective } from 'ng2-charts';
import { GastosSinAnticipoService } from 'src/app/services/gastos-sin-anticipo.service';
import { GastosConAnticipoService } from 'src/app/services/gastos-con-anticipo.service';
interface gastos {
  gasto:string,
  id:number
  total:number,
  gastos:any[]
}

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
})
export class InicioPage  {
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;
  width:number;
  chartHeight  = '100%';
gastos:gastos[]=[];
today:Date = new Date();
y = this.today.getFullYear();
m = this.today.getMonth();
value1 = new Date(this.y, this.m , 1).toISOString();
value2 = new Date(this.y, this.m+1 , 0).toISOString();
total:number = 0;
public pieChartOptions: ChartConfiguration['options'] = {
  responsive: true,
  plugins: {
    legend: {
      display: true,
      position: 'top',
    },
    datalabels: {
      formatter: (value, ctx) => {
        if (ctx.chart.data.labels) {
          return ctx.chart.data.labels[ctx.dataIndex];
        }
      },
    },
  }
};
 pieChartData: ChartData<'pie', number[], string | string[]> = null;
public pieChartType: ChartType = 'pie';
public pieChartPlugins = [ DatalabelsPlugin ];
  sliderOpts = {
    zoom: false,
    slidesPerView: 4,
    spaceBetween: 2,
    centeredSlides: false,
    // Responsive breakpoints
    breakpoints: {
      // when window width is >= 320px
      320: {
        slidesPerView: 2,
        spaceBetween: 5
      },
      // when window width is >= 480px
      480: {
        slidesPerView: 2,
        spaceBetween: 30
      },
      // when window width is >= 640px
      640: {
        slidesPerView: 2,
        spaceBetween: 40
      },
      // when window width is >= 940px
      940: {
        slidesPerView: 3,
        spaceBetween: 40
      },

      // when window width is >= 1200px
      1300: {
        slidesPerView: 4,
        spaceBetween: 40
      }
    },
  };
  constructor(
    public usuariosService: UsuariosService,
    public modalCtrl: ModalController,
    public alertasService: AlertasService,
    public popOverCtrl: PopoverController,
    public anticiposService: AnticiposService,
    public router: Router,
    public popOverController: PopoverController,
    public tiposGastosService: TiposGastosService,
    public alertCtrl: AlertController,
    public controlGastosService: ControlGastosService,
    public gastosSinAnticipoService:GastosSinAnticipoService,
    public gastosConAnticipoService:GastosConAnticipoService,
    public tipoGastosService:TiposGastosService

  ) { }



  ionViewWillEnter() {


    this.controlGastosService.gastos = [];
    this.controlGastosService.syncTiposGastos();
    if (!this.anticiposService.anticipo) {

      return this.alertasService.message('SD1 Móvil', 'Selecciona un anticipo para continuar..')
    }

  }

  async otrasAcciones2() {
    let data1 = 0;
    const alert = await this.alertCtrl.create({
      header: 'SD1 Móvil',
      inputs: [
        {
          label: 'Gastos Sin Anticipo',
          type: 'radio',
          value: '1',
        },
        {
          label: 'Estados De Cuenta',
          type: 'radio',
          value: '2',
        },
        {
          label: 'Sobrantes',
          type: 'radio',
          value: '3',
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {

          },
        },
        {
          text: 'OK',
          role: 'confirm',
          handler: (data) => {
            console.log('data', data)
            if (data == 1) {
              data1 = data;
              this.limpiarDatosAnticipo();

            }
          },
        },
      ],
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();

    if (data1 == 1) {
      this.controlGastosService.gastoSinAnticipo = true;
      this.controlGastosService.sincronizarGastos();
    }
  }
  async listaAnticipos() {

    const modal = await this.modalCtrl.create({
      component: ListaAnticiposPage,
      mode: 'ios',
      initialBreakpoint: 0.55,
      breakpoints: [0, 0.25, 0.5, 0.75]
    })

    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data != undefined) {
      // this.anticiposService.sincronizarGastosConAnticipos();
      this.controlGastosService.sincronizarGastos();
    }
  }
  async otrasAcciones() {

    const modal = await this.modalCtrl.create({
      component: OpcionesPage,
      mode: 'ios',
      initialBreakpoint: 0.55,
      breakpoints: [0, 0.25, 0.5, 0.75]
    })

    await modal.present();
    const { data } = await modal.onDidDismiss();

    if (data != undefined) {

    }
  }

  limpiarDatosAnticipo() {

    this.controlGastosService.limpiarDatos();
    this.controlGastosService.syncTiposGastos();
    this.alertasService.loadingDissmiss();
  }

  limpiarDatos() {
    this.controlGastosService.gastoSinAnticipo = false;
    this.limpiarDatosAnticipo()
  }
  async informacion() {

    const modal = await this.modalCtrl.create({
      component: InformacionPage,
      mode: 'md'
    })
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data != undefined) {
      //this.anticiposService.sincronizarGastosConAnticipos();
      this.controlGastosService.sincronizarGastos();
    }
  }





  cerrarSesion() {
    this.limpiarDatosAnticipo();

    this.usuariosService.usuario = null;
    this.router.navigateByUrl('/');
  }

  async detalle(tipo: gastos) {
    if (!this.controlGastosService.gastoSinAnticipo && !this.anticiposService.vistaAnticipo) return this.alertasService.message('SD1 Móvil', 'No hay gastos que consultar!')

    let modal = await this.modalCtrl.create({
      component: MostrarGastosPage,
      componentProps: {
        tipo: tipo
      }
    })

    modal.present();

  }
  async mostrarGastos() {

    if (!this.controlGastosService.gastoSinAnticipo && !this.anticiposService.vistaAnticipo) return this.alertasService.message('SD1 Móvil', 'No hay gastos que consultar!')
    this.tiposGastosService.tiposGastos = await this.tiposGastosService.getTiposGastos().toPromise();

    let modal = await this.modalCtrl.create({
      component: MisGastosPage,
    })

    modal.present();

  }
  async gestionGastos(estado: string) {
    if (!this.controlGastosService.gastoSinAnticipo && !this.anticiposService.vistaAnticipo) return this.alertasService.message('SD1 Móvil', 'No hay gastos que consultar!')
    this.tiposGastosService.tiposGastos = await this.tiposGastosService.getTiposGastos().toPromise();


    let modal = await this.modalCtrl.create({
      component: GestionGastosPage,
      componentProps: {
        titulo: estado ? 'Liquidaciones' : 'Historial Gastos',
        estado: estado
      }

    })

    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data !== undefined) {

      this.controlGastosService.sincronizarGastos();
    }

  }

  nuevoGasto(){
     this.tiposGastosService.tipo = null;
    if(this.anticiposService.vistaAnticipo){
      this.nuevoGastoAnticipo()
    }
  else{
    this.nuevoGastoSinAnticipo()
    }
  }

  async nuevoGastoAnticipo() {
  
    if (!this.anticiposService.vistaAnticipo.id) {
      return this.alertasService.message('SD1 Móvil', 'Selecciona un anticipo para continuar..')
    }
    if (this.anticiposService.vistaAnticipo.restante < 0) {
      return this.alertasService.message('SD1 Móvil', 'Fondos Insuficientes!..')
    }
    const modal = await this.modalCtrl.create({
      component: NuevoGastoAnticipoPage,
      componentProps: {
        anticipo: this.anticiposService.vistaAnticipo
      },
      mode: 'ios',
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data !== undefined) {
      if (data.check) {

        

      }
    }
  } 
   async nuevoGastoSinAnticipo() {  

    const modal = await this.modalCtrl.create({
      component: NuevoGastoSinAnticipoPage,
      componentProps: {
        anticipo: this.anticiposService.vistaAnticipo
      },
      mode: 'ios',
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data !== undefined) {
      if (data.check) {
   

      }
    }
  }


  cargarPieChart(){
    this.alertasService.presentaLoading('Cargando Datos...')

    if(this.anticiposService.vistaAnticipo){
      this.gastosConAnticipoService.getUsuarioGastosConAnticipoEstadoToPromise(this.anticiposService.vistaAnticipo.iD_LINEA, "").then(resp =>{
        console.log('gastos resp', resp)
        this.alertasService.loadingDissmiss();
        console.log(this.gastos)
        for(let i =0; i < resp.length ; i++){
          console.log( resp[i],' resp[i]')
          this.total += resp[i].monto;
          let g = this.gastos.findIndex(gasto => gasto.id == resp[i].iD_TIPO_GASTO)
              if(g >=0){
                this.gastos[g].gastos.push(resp[i])
                this.gastos[g].total = this.gastos[g].gastos.length;
              }else{
                let  index = this.tipoGastosService.tiposGastos.findIndex( e => e.id == resp[i].iD_TIPO_GASTO)
                this.gastos.push({
                  gasto:this.tipoGastosService.tiposGastos[index].descripcion,
                  id:resp[i].iD_TIPO_GASTO,
                  total:1,
                  gastos:[resp[i]]
                })
              }
          if(i == resp.length -1){
    
  console.log('gastos array', this.gastos)
  
  let labels = [];
  let data = [];
  
  for(let y =0; y < this.gastos.length; y++){
  
    labels.push(this.gastos[y].gasto)
    data.push(this.gastos[y].gastos.length)
    if(y == this.gastos.length -1){
      this.gastos.sort((a,b) => b.total - a.total)
  
      this.pieChartData =  {
        labels: labels,
        datasets: [ {
          data: data
        } ]
      }
  
    }
  }
  
  
          }
        }
  
  
  
  
  
      }, error =>{
        this.alertasService.loadingDissmiss();
  
      })
    }else{
  
      this.gastosSinAnticipoService.sincronizarGastosSinAnticipos( this.usuariosService.usuario.usuario, this.controlGastosService.fechaInicioMes, this.controlGastosService.fechaFinMes).then(resp =>{
        console.log('gastos resp', resp)
        this.alertasService.loadingDissmiss();
        console.log(this.gastos)
        for(let i =0; i < resp.length ; i++){
          console.log( resp[i],' resp[i]')
          this.total += resp[i].monto;
          let g = this.gastos.findIndex(gasto => gasto.id == resp[i].iD_TIPO_GASTO)
              if(g >=0){
                this.gastos[g].gastos.push(resp[i])
                this.gastos[g].total = this.gastos[g].gastos.length;
              }else{
                let  index = this.tipoGastosService.tiposGastos.findIndex( e => e.id == resp[i].iD_TIPO_GASTO)
                this.gastos.push({
                  gasto:this.tipoGastosService.tiposGastos[index].descripcion,
                  id:resp[i].iD_TIPO_GASTO,
                  total:1,
                  gastos:[resp[i]]
                })
              }
          if(i == resp.length -1){
    
  console.log('gastos array', this.gastos)
  
  let labels = [];
  let data = [];
  
  for(let y =0; y < this.gastos.length; y++){
  
    labels.push(this.gastos[y].gasto)
    data.push(this.gastos[y].gastos.length)
    if(y == this.gastos.length -1){
      this.gastos.sort((a,b) => b.total - a.total)
  
      this.pieChartData =  {
        labels: labels,
        datasets: [ {
          data: data
        } ]
      }
  
    }
  }
  
  
          }
        }
  
  
  
  
  
      }, error =>{
        this.alertasService.loadingDissmiss();
  
      })
     
  
    }





  }

}
