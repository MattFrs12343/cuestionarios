export const definitions = {
  "finger_tapping": {
    "key": "finger_tapping",
    "slug": "finger-tapping",
    "className": "FingerTapping",
    "table": "finger_tappings",
    "title": "Manobra de Finger Tapping",
    "assessment": "Avaliação dos Movimentos dos Dedos",
    "description": "Avaliação da velocidade, amplitude, ritmo e coordenação dos dedos",
    "groups": [
      {
        "title": "Movimentos repetitivos dos dedos",
        "objective": "Avaliar a velocidade, a amplitude, o ritmo e a coordenação dos movimentos repetitivos dos dedos, especialmente na investigação de bradicinesia e alterações motoras extrapiramidais.",
        "steps": [
          [
            "Oposição dos dedos",
            "O paciente deve tocar repetidamente a ponta do polegar com a ponta do indicador."
          ],
          [
            "Movimentos repetitivos",
            "Abrir e fechar os dedos o mais rápido e amplamente possível, durante aproximadamente 10 segundos."
          ],
          [
            "Comparar as mãos",
            "Avaliar cada mão separadamente."
          ]
        ],
        "fields": [
          {
            "key": "movimentos_rapidos",
            "type": "boolean",
            "label": "1. O paciente consegue realizar movimentos rápidos e repetitivos de oposição entre o polegar e o indicador?",
            "children": []
          },
          {
            "key": "bradicinesia",
            "type": "boolean",
            "label": "2. Durante a execução, apresenta lentidão dos movimentos (bradicinesia)?",
            "children": [
              {
                "key": "bradicinesia_lados",
                "type": "checks",
                "label": "Lado observado (marque ambos se bilateral)",
                "options": [
                  [
                    "Direita",
                    "Direita"
                  ],
                  [
                    "Esquerda",
                    "Esquerda"
                  ]
                ]
              }
            ]
          },
          {
            "key": "reducao_progressiva",
            "type": "boolean",
            "label": "3. Observa-se redução progressiva da amplitude ou da velocidade dos movimentos?",
            "children": [
              {
                "key": "reducao_lados",
                "type": "checks",
                "label": "Lado observado (marque ambos se bilateral)",
                "options": [
                  [
                    "Direita",
                    "Direita"
                  ],
                  [
                    "Esquerda",
                    "Esquerda"
                  ]
                ]
              }
            ]
          },
          {
            "key": "irregularidade_ritmo",
            "type": "boolean",
            "label": "4. O paciente apresenta dificuldade de coordenação, interrupções ou irregularidade no ritmo dos movimentos?",
            "children": [
              {
                "key": "irregularidade_lados",
                "type": "checks",
                "label": "Lado observado (marque ambos se bilateral)",
                "options": [
                  [
                    "Direita",
                    "Direita"
                  ],
                  [
                    "Esquerda",
                    "Esquerda"
                  ]
                ]
              }
            ]
          },
          {
            "key": "interrupcao",
            "type": "boolean",
            "label": "5. Durante a execução da manobra, o paciente apresentou interrupção ou incapacidade de manter os movimentos repetitivos? Em quantos segundos ocorreu a interrupção?",
            "children": [
              {
                "key": "interrupcao_lados",
                "type": "checks",
                "label": "Lado observado (marque ambos se bilateral)",
                "options": [
                  [
                    "Direita",
                    "Direita"
                  ],
                  [
                    "Esquerda",
                    "Esquerda"
                  ]
                ]
              },
              {
                "key": "tempo_direito_segundos",
                "type": "number",
                "label": "Mão direita (segundos)"
              },
              {
                "key": "tempo_esquerdo_segundos",
                "type": "number",
                "label": "Mão esquerda (segundos)"
              }
            ]
          },
          {
            "key": "alteracoes",
            "type": "checks",
            "label": "Comportamento durante a manobra",
            "options": [
              [
                "interrupcao_espontanea",
                "Interrupção espontânea"
              ],
              [
                "reducao_velocidade",
                "Redução progressiva da velocidade"
              ],
              [
                "reducao_amplitude",
                "Redução progressiva da amplitude"
              ],
              [
                "incapacidade",
                "Incapacidade de continuar a manobra"
              ],
              [
                "completou_tempo",
                "Completou o tempo solicitado"
              ]
            ]
          }
        ]
      }
    ]
  },
  "mingazzini": {
    "key": "mingazzini",
    "slug": "mingazzini",
    "className": "Mingazzini",
    "table": "mingazzinis",
    "title": "Manobra de Mingazzini — MMSS e MMII",
    "assessment": "Avaliação dos Membros Inferiores e Superiores",
    "description": "Avaliação conjunta da força e sustentação de membros inferiores e superiores",
    "groups": [
      {
        "title": "Membros inferiores — MMII",
        "objective": "Avaliar a força muscular e identificar paresias discretas dos membros inferiores (MMII), especialmente relacionadas ao comprometimento da via corticoespinal.",
        "steps": [
          [
            "Posição inicial",
            "O paciente permanece em decúbito dorsal (deitado de costas)."
          ],
          [
            "Posicionar os membros inferiores",
            "Manter os quadris e joelhos flexionados aproximadamente a 90°."
          ],
          [
            "Avaliar a sustentação",
            "Manter ambas as pernas elevadas durante 20 a 30 segundos, sem apoio."
          ]
        ],
        "fields": [
          {
            "key": "mmii_sustenta_posicao",
            "type": "boolean",
            "label": "1. O paciente consegue manter os dois membros inferiores elevados, com quadris e joelhos flexionados a 90°, durante 20 a 30 segundos?",
            "children": []
          },
          {
            "key": "mmii_queda",
            "type": "boolean",
            "label": "2. Durante a manobra, apresenta queda progressiva de um dos membros inferiores?",
            "children": [
              {
                "key": "mmii_queda_lados",
                "type": "checks",
                "label": "Lado observado (marque ambos se bilateral)",
                "options": [
                  [
                    "Direita",
                    "Direita"
                  ],
                  [
                    "Esquerda",
                    "Esquerda"
                  ]
                ]
              }
            ]
          },
          {
            "key": "mmii_tremor",
            "type": "boolean",
            "label": "3. Observa-se tremor, oscilação ou dificuldade para manter a posição?",
            "children": [
              {
                "key": "mmii_tremor_lados",
                "type": "checks",
                "label": "Lado observado (marque ambos se bilateral)",
                "options": [
                  [
                    "Direita",
                    "Direita"
                  ],
                  [
                    "Esquerda",
                    "Esquerda"
                  ]
                ]
              }
            ]
          },
          {
            "key": "mmii_assimetria",
            "type": "boolean",
            "label": "4. O paciente apresenta diferença de força muscular entre os membros inferiores durante a execução?",
            "children": [
              {
                "key": "mmii_assimetria_lado",
                "type": "select",
                "label": "Maior dificuldade",
                "options": [
                  [
                    "Direita",
                    "Maior dificuldade à direita"
                  ],
                  [
                    "Esquerda",
                    "Maior dificuldade à esquerda"
                  ]
                ]
              }
            ]
          },
          {
            "key": "mmii_interrupcao",
            "type": "boolean",
            "label": "5. Durante a execução da manobra, o paciente apresentou queda de um ou ambos os membros inferiores ou incapacidade de manter a posição? Após quantos segundos ocorreu a alteração?",
            "children": [
              {
                "key": "mmii_interrupcao_lados",
                "type": "checks",
                "label": "Lado observado (marque ambos se bilateral)",
                "options": [
                  [
                    "Direita",
                    "Direita"
                  ],
                  [
                    "Esquerda",
                    "Esquerda"
                  ]
                ]
              },
              {
                "key": "mmii_tempo_direito_segundos",
                "type": "number",
                "label": "Membro inferior direito (segundos)"
              },
              {
                "key": "mmii_tempo_esquerdo_segundos",
                "type": "number",
                "label": "Membro inferior esquerdo (segundos)"
              }
            ]
          },
          {
            "key": "mmii_alteracoes",
            "type": "checks",
            "label": "Tipo de alteração observada",
            "options": [
              [
                "queda_progressiva_direita",
                "Queda progressiva do membro direito"
              ],
              [
                "queda_progressiva_esquerda",
                "Queda progressiva do membro esquerdo"
              ],
              [
                "queda_subita_direita",
                "Queda súbita do membro direito"
              ],
              [
                "queda_subita_esquerda",
                "Queda súbita do membro esquerdo"
              ],
              [
                "fadiga_direita",
                "Fadiga muscular à direita"
              ],
              [
                "fadiga_esquerda",
                "Fadiga muscular à esquerda"
              ],
              [
                "tremor",
                "Tremor ou oscilação acentuada"
              ],
              [
                "dor",
                "Dor durante a sustentação"
              ],
              [
                "incapacidade",
                "Incapacidade de manter a posição"
              ],
              [
                "sem_alteracoes",
                "Completou o tempo solicitado sem alterações"
              ]
            ],
            "exclusive": "sem_alteracoes"
          }
        ]
      },
      {
        "title": "Membros superiores — MMSS",
        "objective": "Avaliar a força muscular, o controle postural e a presença de paresias discretas nos membros superiores, especialmente associadas ao comprometimento da via corticoespinal.",
        "steps": [
          [
            "Posição inicial",
            "O paciente permanece sentado ou em pé."
          ],
          [
            "Posicionar os membros superiores",
            "Manter ambos os braços estendidos à frente, na altura dos ombros, com as palmas das mãos voltadas para cima."
          ],
          [
            "Avaliar a sustentação",
            "Manter os olhos fechados durante 20 a 30 segundos."
          ]
        ],
        "note": "O documento de referência indica 20 a 30 segundos nas instruções de MMSS e 60 segundos na primeira pergunta. Os dois tempos foram preservados para revisão do protocolo.",
        "fields": [
          {
            "key": "mmss_sustenta_posicao",
            "type": "boolean",
            "label": "1. O paciente consegue manter ambos os membros superiores estendidos à frente do corpo, com as palmas das mãos voltadas para cima, durante 60 segundos?",
            "children": []
          },
          {
            "key": "mmss_queda_pronacao",
            "type": "boolean",
            "label": "2. Durante a manobra, apresenta queda progressiva de um dos membros superiores ou pronação involuntária do antebraço?",
            "children": [
              {
                "key": "mmss_queda_lados",
                "type": "checks",
                "label": "Lado observado (marque ambos se bilateral)",
                "options": [
                  [
                    "Direita",
                    "Direita"
                  ],
                  [
                    "Esquerda",
                    "Esquerda"
                  ]
                ]
              }
            ]
          },
          {
            "key": "mmss_tremor",
            "type": "boolean",
            "label": "3. Observa-se tremor, oscilação ou dificuldade para manter os membros superiores elevados?",
            "children": [
              {
                "key": "mmss_tremor_lados",
                "type": "checks",
                "label": "Lado observado (marque ambos se bilateral)",
                "options": [
                  [
                    "Direita",
                    "Direita"
                  ],
                  [
                    "Esquerda",
                    "Esquerda"
                  ]
                ]
              }
            ]
          },
          {
            "key": "mmss_assimetria",
            "type": "boolean",
            "label": "4. O paciente apresenta diferença de força muscular ou dificuldade de sustentação entre os membros superiores durante a execução?",
            "children": [
              {
                "key": "mmss_assimetria_lado",
                "type": "select",
                "label": "Maior dificuldade",
                "options": [
                  [
                    "Direita",
                    "Maior dificuldade à direita"
                  ],
                  [
                    "Esquerda",
                    "Maior dificuldade à esquerda"
                  ],
                  [
                    "Bilateral",
                    "Dificuldade bilateral"
                  ]
                ]
              }
            ]
          },
          {
            "key": "mmss_desconforto",
            "type": "boolean",
            "label": "5. Durante a manobra, apresenta dor, fadiga muscular, perda progressiva da posição ou incapacidade de completar o tempo solicitado?",
            "children": [
              {
                "key": "observacoes",
                "type": "text",
                "label": "Qual?"
              }
            ]
          },
          {
            "key": "mmss_tempo_direito_segundos",
            "type": "number",
            "label": "Membro superior direito (segundos)"
          },
          {
            "key": "mmss_tempo_esquerdo_segundos",
            "type": "number",
            "label": "Membro superior esquerdo (segundos)"
          }
        ]
      }
    ]
  },
  "raimiste": {
    "key": "raimiste",
    "slug": "raimiste",
    "className": "Raimiste",
    "table": "raimistes",
    "title": "Manobra de Raimiste",
    "assessment": "Avaliação dos Membros Superiores",
    "description": "Avaliação da sustentação e controle motor dos membros superiores",
    "groups": [
      {
        "title": "Membros superiores",
        "objective": "Observar a manutenção da posição, a presença de queda ou desvio de um dos antebraços, assimetria entre os membros superiores, tremores, fadiga e dificuldade de sustentação.",
        "steps": [
          [
            "Posição inicial",
            "O paciente deve permanecer em decúbito dorsal (deitado de costas), com ambos os ombros em posição adequada."
          ],
          [
            "Posicionar os cotovelos",
            "Manter os cotovelos flexionados a 90° e apoiados sobre o leito."
          ],
          [
            "Avaliar a sustentação",
            "Manter os antebraços elevados e as mãos abertas durante aproximadamente 60 segundos."
          ]
        ],
        "fields": [
          {
            "key": "sustenta_posicao",
            "type": "boolean",
            "label": "1. O paciente consegue manter ambos os antebraços na posição inicial da manobra, com os cotovelos flexionados a 90°, durante 60 segundos?",
            "children": []
          },
          {
            "key": "pronacao_supinacao",
            "type": "boolean",
            "label": "2. Durante a manobra, apresenta movimentos involuntários de pronação ou supinação de um dos antebraços?",
            "children": [
              {
                "key": "pronacao_lados",
                "type": "checks",
                "label": "Lado observado (marque ambos se bilateral)",
                "options": [
                  [
                    "Direita",
                    "Direita"
                  ],
                  [
                    "Esquerda",
                    "Esquerda"
                  ]
                ]
              }
            ]
          },
          {
            "key": "tremor_oscilacao",
            "type": "boolean",
            "label": "3. Observa-se tremor, oscilação, assimetria ou dificuldade para manter a posição dos membros superiores?",
            "children": [
              {
                "key": "tremor_lados",
                "type": "checks",
                "label": "Lado observado (marque ambos se bilateral)",
                "options": [
                  [
                    "Direita",
                    "Direita"
                  ],
                  [
                    "Esquerda",
                    "Esquerda"
                  ]
                ]
              }
            ]
          },
          {
            "key": "assimetria",
            "type": "boolean",
            "label": "4. O paciente apresenta diferença de força muscular ou dificuldade de controle motor entre os membros superiores durante a execução?",
            "children": [
              {
                "key": "assimetria_lado",
                "type": "select",
                "label": "Maior dificuldade",
                "options": [
                  [
                    "Direita",
                    "Maior dificuldade à direita"
                  ],
                  [
                    "Esquerda",
                    "Maior dificuldade à esquerda"
                  ],
                  [
                    "Bilateral",
                    "Dificuldade bilateral"
                  ]
                ]
              }
            ]
          },
          {
            "key": "desconforto",
            "type": "boolean",
            "label": "5. Durante a manobra, apresenta dor, fadiga muscular, desvio progressivo do antebraço ou incapacidade de completar o tempo solicitado?",
            "children": [
              {
                "key": "observacoes",
                "type": "text",
                "label": "Qual?"
              }
            ]
          },
          {
            "key": "tempo_direito_segundos",
            "type": "number",
            "label": "Membro superior direito (segundos)"
          },
          {
            "key": "tempo_esquerdo_segundos",
            "type": "number",
            "label": "Membro superior esquerdo (segundos)"
          }
        ]
      }
    ]
  },
  "wartenberg": {
    "key": "wartenberg",
    "slug": "wartenberg",
    "className": "Wartenberg",
    "table": "wartenbergs",
    "title": "Teste de Wartenberg",
    "assessment": "Avaliação do Sinal do Dedo Mínimo",
    "description": "Avaliação do sinal do dedo mínimo e da função motora do nervo ulnar",
    "groups": [
      {
        "title": "Sinal do dedo mínimo",
        "objective": "Avaliar a função motora do nervo ulnar (cubital), especialmente dos músculos interósseos da mão, responsáveis pela adução e abdução dos dedos.",
        "steps": [
          [
            "Posicionar a mão",
            "O paciente deve manter a mão aberta, com os dedos estendidos e aproximados."
          ],
          [
            "Observar o dedo mínimo",
            "Solicitar que mantenha o dedo mínimo junto ao dedo anelar, observando se ocorre afastamento involuntário do quinto dedo."
          ],
          [
            "Comparar as mãos",
            "Realizar o teste em ambas as mãos, comparando os resultados."
          ]
        ],
        "fields": [
          {
            "key": "afastamento_involuntario",
            "type": "boolean",
            "label": "1. O paciente apresenta afastamento involuntário do dedo mínimo em relação aos demais dedos da mão?",
            "children": [
              {
                "key": "afastamento_lados",
                "type": "checks",
                "label": "Lado observado (marque ambos se bilateral)",
                "options": [
                  [
                    "Direita",
                    "Direita"
                  ],
                  [
                    "Esquerda",
                    "Esquerda"
                  ]
                ]
              }
            ]
          },
          {
            "key": "dificuldade_manter",
            "type": "boolean",
            "label": "2. Ao solicitar que mantenha os dedos unidos durante 20 a 30 segundos, apresenta dificuldade para manter o dedo mínimo aproximado ao dedo anelar?",
            "children": [
              {
                "key": "manter_lados",
                "type": "checks",
                "label": "Lado observado (marque ambos se bilateral)",
                "options": [
                  [
                    "Direita",
                    "Direita"
                  ],
                  [
                    "Esquerda",
                    "Esquerda"
                  ]
                ]
              }
            ]
          },
          {
            "key": "dificuldade_aproximar",
            "type": "boolean",
            "label": "3. O paciente apresenta dificuldade para aproximar voluntariamente o dedo mínimo do dedo anelar?",
            "children": [
              {
                "key": "aproximar_lado",
                "type": "select",
                "label": "Maior dificuldade",
                "options": [
                  [
                    "Direita",
                    "Maior dificuldade à direita"
                  ],
                  [
                    "Esquerda",
                    "Maior dificuldade à esquerda"
                  ]
                ]
              }
            ]
          },
          {
            "key": "fraqueza_assimetria",
            "type": "boolean",
            "label": "4. Durante a avaliação, observa-se fraqueza muscular ou assimetria no controle dos movimentos dos dedos?",
            "children": [
              {
                "key": "fraqueza_lados",
                "type": "checks",
                "label": "Lado observado (marque ambos se bilateral)",
                "options": [
                  [
                    "Direita",
                    "Direita"
                  ],
                  [
                    "Esquerda",
                    "Esquerda"
                  ]
                ]
              }
            ]
          },
          {
            "key": "alteracao_sensibilidade",
            "type": "boolean",
            "label": "5. O paciente apresenta dormência, formigamento ou redução da sensibilidade no dedo mínimo e na metade ulnar do dedo anelar?",
            "children": [
              {
                "key": "sensibilidade_lados",
                "type": "checks",
                "label": "Lado observado (marque ambos se bilateral)",
                "options": [
                  [
                    "Direita",
                    "Direita"
                  ],
                  [
                    "Esquerda",
                    "Esquerda"
                  ]
                ]
              }
            ]
          },
          {
            "key": "tempo_mantido_segundos",
            "type": "number",
            "label": "Tempo mantido (segundos)"
          }
        ]
      }
    ]
  }
};
