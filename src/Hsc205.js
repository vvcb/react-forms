import React from "react";
import { Engine } from 'json-rules-engine';

import Form from "react-jsonschema-form";

// https://kinto.github.io/formbuilder/#/builder
// http://www.alpacajs.org/demos/form-builder/form-builder.html
// https://github.com/kiho/react-form-builder

const schema = {
    title: "Clinical Information",
    type: "object",
    required: ["gender", "age"],
    properties: {
        gender: {
            type: "string",
            title: "Gender",
            enum: ["m", "f"],
            enumNames: ["Male", "Female"]
        },
        age: {
            type: "integer",
            title: "Age",
            default: 60,
            minimum: 18,
            maximum: 100
        },
        symptoms: {
            type: "array",
            title: "Symptoms",

            items: {
                type: "string",
                enum: [
                    "anaemia",
                    "wt_loss",
                    "prb",
                    "cibh",
                    "mass",
                    "abdo_pain"
                ],
                enumNames: [
                    "Anaemia",
                    "Weight Loss",
                    "Rectal Bleeding or Melena",
                    "Change in bowel habits",
                    "Abdominal or rectal mass",
                    "Abdominal Pain"
                ]
            },
            uniqueItems: true


        }
    }
};
const uiSchema = {
    gender: {
        "ui:widget": "radio"
    },
    age: {
        "ui:widget": "range"
    },
    symptoms: {
        "ui:widget": "checkboxes"
    }
};

const log = (type) => console.log.bind(console, type);

function Hsc205() {
    return (
        <Form schema={schema}
            uiSchema={uiSchema}
            onChange={log("changed")}
            onSubmit={onSubmit}
            // onSubmit=  {log("submitted")}
            onError={log("errors")} />
    )
}

const onSubmit = (e) => {
    let facts = new Map(Object.entries(e.formData))
    facts.forEach((v, k, m) => {
        engine.addFact(k, v)
    })

    runengine()
};



// Rule Engine

let engine = new Engine();

// they are aged 40 and over with unexplained weight loss and abdominal pain
engine.addRule({
    conditions: {
        all: [{
            fact: 'age',
            operator: 'greaterThanInclusive',
            value: '40'
        },
        {
            fact: 'symptoms',
            operator: 'contains',
            value: 'wt_loss'
        },
        {
            fact: 'symptoms',
            operator: 'contains',
            value: 'abdo_pain'
        }]
    },
    event: {
        type: 'wt_loss_pain_over_40)',
        params: {
            message: 'Unexplained weight loss with abdo pain over 40'
        }
    }
});

// they are aged 50 and over with unexplained rectal bleeding 
engine.addRule({
    conditions: {

        all: [{
            fact: 'age',
            operator: 'greaterThanInclusive',
            value: '50'
        }, {
            fact: 'gender',
            operator: 'equal',
            value: 'm'
        }, {
            fact: 'symptoms',
            operator: 'contains',
            value: 'prb'
        }],
    },
    event: {
        type: 'Rectal bleeding over 50',
        params: {
            message: 'Rectal bleeding over 50'
        }
    }
});

function runengine() {
    engine
        .run()
        .then(events => {
            events.map(event => console.log(event.params.message))

        })
}
;



export default Hsc205;