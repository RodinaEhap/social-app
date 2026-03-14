import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuggestionsCardComponent } from './suggestions-card.component';

describe('SuggestionsCardComponent', () => {
  let component: SuggestionsCardComponent;
  let fixture: ComponentFixture<SuggestionsCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuggestionsCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuggestionsCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
