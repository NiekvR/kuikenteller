export class Sighting {
    species: string;
    localId: number;
    numberOfChicks: number;
    gezinEerderGemeld: boolean;
    certaintyRecapture: string;
    habitat: string;
    remarks: string;
    lat: number;
    lng: number;
    age: string;
    photo: string;
    waarnemingId: string;
    sigthingDate: Date | string;
    observerName: string;
    observerEmail: string;
    permission: boolean;
    uploaded: boolean;
    gezinEerderGemeldWithId: string;
    surface: string;
    shore: string;
    water: string;
    numberOfDeaths: number;
    causeOfDeath: string;
    deathReason: string;
    predation: string;
    aggression: string;
    humanActivity: string;
    deathReasonOther: string;
    extraFeedings: string;
    constructor(){};
}
