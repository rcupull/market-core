"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
describe('getAllFilterQuery', () => {
    it('some', () => {
        const args = {
            routeNames: ['routeName1', 'routeName2'],
            postsIds: ['postId1', 'postId1'],
            search: 'search',
            postCategoriesLabels: ['label1', 'label2'],
            postCategoriesMethod: 'some'
        };
        expect((0, utils_1.getAllFilterQuery)(args)).toMatchInlineSnapshot(`
      {
        "_id": {
          "$in": [
            "postId1",
            "postId1",
          ],
        },
        "name": {
          "$options": "i",
          "$regex": /search/,
        },
        "postCategoriesLabels": {
          "$in": [
            "label1",
            "label2",
          ],
        },
        "routeName": {
          "$in": [
            "routeName1",
            "routeName2",
          ],
        },
      }
    `);
    });
    it('every', () => {
        const args = {
            routeNames: ['routeName1', 'routeName2'],
            postsIds: ['postId1', 'postId1'],
            search: 'search',
            postCategoriesLabels: ['label1', 'label2'],
            postCategoriesMethod: 'every'
        };
        expect((0, utils_1.getAllFilterQuery)(args)).toMatchInlineSnapshot(`
      {
        "_id": {
          "$in": [
            "postId1",
            "postId1",
          ],
        },
        "name": {
          "$options": "i",
          "$regex": /search/,
        },
        "postCategoriesLabels": {
          "$all": [
            "label1",
            "label2",
          ],
        },
        "routeName": {
          "$in": [
            "routeName1",
            "routeName2",
          ],
        },
      }
    `);
    });
});
describe('getPostSlug', () => {
    it('render', () => {
        expect([
            'Suspensión FOX 27.5” con Tratamiento Kashima!',
            '  Bicicleta MTB Rodado 29 - Aluminio  ',
            'Casco Enduro / Trail - Negro & Azul',
            'MULTIHERRAMIENTA 20 FUNCIONES #PRO',
            'Luz trasera USB recargable 💡🚴',
            'Sillín ergonómico – modelo Élite',
            'Aceite para cadena (uso húmedo) 120ml',
            'Guantes talla L - Anti-deslizante - rojo',
            'Rueda 27.5 x 2.40 Maxxis Minion DHR II',
            'Kit de freno hidráulico Shimano (delantero + trasero)'
        ].map(utils_1.getPostSlug)).toMatchInlineSnapshot(`
      [
        "suspension-fox-275-con-tratamiento-kashima",
        "bicicleta-mtb-rodado-29-aluminio",
        "casco-enduro-trail-negro-azul",
        "multiherramienta-20-funciones-pro",
        "luz-trasera-usb-recargable",
        "sillin-ergonomico-modelo-elite",
        "aceite-para-cadena-uso-humedo-120ml",
        "guantes-talla-l-anti-deslizante-rojo",
        "rueda-275-x-240-maxxis-minion-dhr-ii",
        "kit-de-freno-hidraulico-shimano-delantero-trasero",
      ]
    `);
    });
});
