import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { Drug } from '../../models/drug.model';

@Component({
  selector: 'app-drug-card',
  standalone: true,
  imports: [CommonModule, CardModule],
  templateUrl: './drug-card.component.html',
  styleUrls: ['./drug-card.component.scss']
})
export class DrugCardComponent {
  @Input() drug!: Drug;
}
