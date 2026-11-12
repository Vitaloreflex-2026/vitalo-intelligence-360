-- `deals.training_type` now holds the service type picked when the contract is
-- created: workshop, training or conference. Map the former delivery shapes onto
-- it. An individual workshop keeps its "individual" nature in
-- `qvct_workshop_type`, unless a workshop format was already recorded there.
update public.deals
set
    qvct_workshop_type = coalesce(qvct_workshop_type, 'individual'),
    training_type = 'workshop'
where training_type = 'individual_workshop';

update public.deals
set training_type = 'training'
where training_type = 'collective';
