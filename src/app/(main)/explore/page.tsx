import {
  Calendar,
  CreditCard,
  Heart,
  Settings,
  Star,
  User,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function Page() {
  const mockPets = [
    {
      id: "1",
      name: "Luna",
      birth: new Date("2020-03-15"),
      image:
        "data:image/webp;base64,UklGRhgeAABXRUJQVlA4IAweAADwpACdASo4ATgBPpFEnEolo6KtqBMqSbASCWduvTBpEvLdHWuRimqtjFF59WZc/Q6Jnar1g+Efzc1EcUP+F3e258ZJO/+zaNLM6PFeDT9l34Bb118pOp687PzI5s4xLcAoPgESAc1uiEXhRiK88NkVCI2JFmhcmeaLEVPNErDRstChTVDw5IdtojmJK+KGpBJj5rJG4hx4hOcbSLdeOHaIGobwvKBEldmJ6WqYP7LmdDFSrUwEEjUa9YhGcq5yB3PaWovYA9CZhllrBJO/9/Xo6C9LhheyMuNWNVtyywmjo3f5ttWhAHfVJIfpAxFTExyBfATMj1aE8IRQ67bX86nOSvdzXrZH27nnsEFhV4150UkxWpQoxMbqJfx7VBcAepd+mkO0jzlLHD3ddy3BqWVQKE8ZtBnNWo7/2RQZ4OepQUNySYykXBGu2mKt6ulbU86HowsOv4gcXUNkpRMX2njplPHNQsx/HYOJ+mmYj0gJAhro8EURixI7p9l1bHNM1jhsj51qMN7eM9HZ1RoNgVGmhc+tbgOn31Re1gz4GC4PNFHcXtVqShInnYPP1Mytar16DjlbZqu64xzmrJIHXho6/+4UIvd2JfR1jYLIyFJU8wn47KGM+nSVNbPGGkmeLWi5WyoQW4SQtHL8Ndg2mXjpKHo4bcs32cVe4vjk80vl9NmSA/mub0dJG5SfBcZ8b0AyXrTQlr3vQ8ztNcT0kYlw9I5pSOJZ4kkJ1HkBblPlRgE7gcpbetn12enQPn05Wz8k7W9YwPK5g9tNcrRrBmhIy9w/hXO2paa/MfnOB4onkNyeswqRx6HnXazLjBITDPSa//8taHQAxeSd/KHfBmB1ozV2PZccDeq4ixAeDOQTBJ6JekE5hWhlL+3E1bUzeSqSUmgtDtRFRYChc0uFVGfXjUfIiwimip2+5Nak7zEMgT9krDlkTydG+p7mNvRcySYnRYcbg1prOjJAx8ahKvK0ukZ59AIocsnm6aM3f9Qf8d1fdehjuvnRuDCQQqtMG6gdr04DuHLV7+JQ/Ci4eqVX6bAeTbsJCRxyFkUolw2jbtqL1y5lMoHItaZGeQYSs0QQv2HJbmmLPz+yxjsK0jOEcTHIl5VQkYHQ42EbK6bNZEkZonVrbYQZMV0sLfV9BvdndkhOubJAnpIAElORXJgKvw3LyTD4JRQjI6FT04m+kGaWGLbPhpW3+mPmsUlWCQhvIbFl4EmcDdDpoaUxtJ0CeINsLTH2lo0HZFqDap+q4YZWrbLdFcbUVovE+gMQ1jhRaQtYI8IGXDE3wRHV3aEUXhXAunPFfXuEr2BqkJK/BuXeMLDHZNfVHCYIyFG29wDI2kfrpnQAYNmY5AeetDJqCIH2r+3xlyIRtLewgeerx53WnwXtcx885Kcp01q0FWrijQDRFmFr91ahcPeJi0w0aoclNfYJh3vQtNbs+MSW5P2+gI7yWMbDl+3Tq0U5B1bl7wFRdVqrovM589egYnN0+Eo9CZkVLpfw4remkxW0bC3caOkHoFhcACxlAEtl9Je6W9VJHjQ8gGCeF2BV9iemu99I+CLG4iklREm0BzZV47TcdUUtNdesSGzrvzmiYmlAR2ccVmRf2BECaDkU0Fuhr3naeCjhbwDaujHFIi2++/5CFQiIXv63XbUEJvqsw0fIFGo2k/NfG/oMR3eFu4xLwwkqLOVbxj8C1d+wDXy4D5LENvqnrZsXHGI5iOauAhiEWI6z7pT7ettASkMTfDJLuXqC0R5jLN4IOs9xbiisAAD+9ThTFSn826+4bo/gTCEwlmhEXM642qZdenDUlTlaTVhaRn6NBD7WBCb1dFsPPEO6x2xvbE0ZMRzdngOIn6uQ8AVLJt7bSlA8nXsnKE9UPN2C/SsChWhbnhK5yx3wQOK/ksU+jn++EvXqKetpxcmSca5WSST6KBjDKsEKtwMMGICtCdwTg6tmZFlVd3V7o7jXX7VSZeOojESixA9ZPk/KBQbwpBqkRV3RVYhTBo2HP2YNetzRG7Rg5OydX9bVhcaqgwRO+7DH49qJAaQduEuGwBl0FhWY3kogfrFQgcsSyAHgD8UkXXCEkdZUuoVwVsCdpOy6IB9pFDPM37JvYJ/YIdiHeu0D7VWyRSslp+j2mRkMy3pOGhtOGXdZMQ01JZRg1PM6NE5dQ5NDH87e3JSN6nDxDbSn4WqGOBCjfgS+upeZaj/0F3HCT9ZvN42vh79YiefkXuOahS3oTvLdgsYffQjJaw61mrqDKsYStn6TLWntnmA0WqXHx9AKhcp7FusWI/oNNcY/d9haX6j7cszx3OYVtFV95EpvgUb5pmAVvJPYY0aruhkdXWpeCN9melbiSF0jsJTQ242ICRJoMv3j3tCHTTIgdut6cjqVwZ2Nli+MiI1Jbvvit/Piw5WU//TbEJyHPUpu5t2Cv5I/3FCg+ST74aThRbWUUm/ib7j7oYHTzpDVsoIMavfj2f6WZyJSFMFsXZVMyhnbz7F1N18saKIby6NEjYyTTHd6y69O4/6j57w9jqpxoqcQeLEB/1hGChwjZc18BLi1CcSKx5zF8TJIqco1dATj1fYQX4oh4hhHmy2P4GiHGrcrzerD4FAsrxFbtMbJ/NmW/c349+LIHYfEMtr6csC3xwOOqBP3P0owXiKYj2MjU9xHZ4j4pn5I21LzGLXY++2Qg+hyHwnlT/DbijxgL6PDbvESPEooZJJjbIbjUWzfDyU7XO1229w8b4pGSaVgzgPr0RjzJAP8TjtQDjvfpdg4MzJK/zb6H9C/dOfcqGIY5w0OGE1x04yZ/5S4Brx+UXyLqEP3kqVNbW4Q0wWzUn1yFTvR5JkPX+p5gfPDg3PgAYbxKN1PBI6aDChG4tpsnMZByX+8pFcFC4OaSrsS2R9hmq2ws5jAIoPxAHlSde1kaRPt+nuoqRTR5bIc9JSjmZTeZUReMHDrRu9fSHpqJWTs7hF0+lGHOy+gJ+j3OrIFPpRIMLtvasoJ4IUKgT7FdNqn/5P3o2JAkPEwyZO4CRZRn+9PREXK0ra4pIAKYWOEcNt6ihRLMFkV8+GbGakAvEIhstyYuXc5N4x3ehjHHg4ARJrgvk2QoD3SoSNiOdyYOhD7Q+n5uFl658xcXVbwHMrtQecY+g9HomM1ABMWi4+d3OpdAVvMmEekMEM8j+veBZvwD5ZMxmLks3UB4Wyzy9J7DKy8LlhWE/MxBjuXPh3+UZC1zOHH4KhPsHDZHl31048rM62edNmUevHsYnGN0q2hLbhi0kkqDUU2cGf671Nsq75qmFhFMoZ/G5f7XvRg2JjuouK5J8uLsUw56h7xef7JtMuPYv9qQVw1IcXecsF6XqxR/F+BNx27dH3lS/KdBCVFvvEmwmVil5X6ZViRRz/2TzmsklD8BPqkkaBTs9QSPhcBsVQ9gS2zPa/rpGM5ODrgI5+fHP3N0gE4wpBxahzy5lBfc0TXnr4oe+8XpjQkcHO2U6S1hu5n4I7B5e9UldTjOzxyOig4VXzxdaHRQcRBolbPND0ZjaswwxMsQg5a9dPx+C39A7rMELtq6R8ffxjY5no5t24GKCRmz0WsIe51BycSsp/2Iqee7bdMgUNfFAilf0+cRrrL/UT81l+jD9GNcF2rgBvxAWEin3yHfPxlqN0PjxnjvGBgSln61NbXuHYaOfkf7NqNGo5B7msq5O9uhu7hz+hCIZWVEsITanO/qEdNv2fcvSs+FlGR1lsWOS0jQgji7TpVWD4Mkios1Xsn5ekxL66a4J6mdMnRCsNduZ5jsFUW01EcZhwd2LZqlUEwUaTqpOBqimZjdi1iaakOwh8zlmEkAvG2LmYTvZAFLTf8vT6xGC3OJrhevM7jIkBFdjOpbKsUI4V7Srn4sAsoSC2FBwZvLcLNoRASotyE2KtLPx8zfoTBdRQbZzFSjbFYDs43/qqzNC6NAKll5kKMqJGwZMRLonxh5lQ5Vin0l7YVsSTH8XGt5KrpIR+t0TNOsaqYmIxk7k+dF7pufefaWPpBBuEe8GK8XIUgbfXqum18wqQGNTwOhvPthHxKW1I/qRUOtGFAKZncHJT8ZF0mCVoPs1Q5oddFH+7MJoSObRj2BiBIweZ0ryQfBma9TEyXaQYHQYGQRULKFV58lsrAceEWtAoc1OOm5JdCqSr7UP4Wy8V8toBV+r7dZb074DXmAvU00P6GdtTmbIyvnkQt1qztTfVSewX2YoZl5pxoEXz83s4nXU3I2Ny5LBvee1bo4lvvC+0KSV41KrwxvoAlgrJ6kn3veNYg+ARA4OJ+i/Otvt2pImLTSVkyETD0XTLs2wRlYW2ofAOMVA1p927GHaj+T1UhtOcbAeoeEOtfyg5C1bMWY3QzKXpS2jksSOqNcKllRJx+ztrResbVYCJJ76Nu4ljRkNER5TWa8o/w+fnt7MeVquOKxstaJ1BZsQ/oUeycvGIxI/lUWn2DMeb981wW7XqqehTPCb+h9kH5cGSK8hQCzNK7fHH6hzw8b/KIGbMr+jVwkHwklC2IhGSsve/5yA3FU2So8u4vYkxuz1BVPDJjUoZzfng9fs7v7Aa9woma2qgP7Nsl7cRisuFJuNAA3Rls0arcLhSNeY/F2OSTNVQCJdccSi4zADLtMhYZ3wALxcagUcoxfjsLq8EFCTfOYnCXg+SK8dAHVx2i7JstR08D+wn94q7Zchd4oI2Rv2ukV+2H/XerVrAWfet2JM9NtujDeC6t6Mm14ZJ/ycaVP/qSrlYUxUTTRogsSz9M3GREGDirw4VuN+Uc7HH1AZPaUbMTsE2cKHBgJ18Uf/QBM9ehPsdIhOtut4jDQEAYpKoi2w23ScYhB4fG6S+2nNDTdpF+EDM6lXFdL8FE/89agLculq1y1hwY2ASqYVH/Oph9qA7JCHrsBwrEdul4UQjy7Roq3KM5iVm7AVPehpfCiky694N/+VQxDvymgXHGgSk2QYNObxURcuFLj7m4eYxEWNZCvxnySutG7/o7Xr1YXVBxSnUruyEz9jxFg9T7YYLi8KJtIZwkPBUa3kEkLzkABRgYWxMnOJ6qfCahy6klO5SsZdDB9JBVUdjYDGMn0Md2FYTd9VYFdSgwm/ewJIZVQWIaNCfgiGa7JBM4kfqUv+3NqvxYx0JFOhAPMEVPaNmTfG4d+jdnlIbxqDCjho3O7RtNbMdCY3QEoMk8pFvVTkjH6KrhJkqozUd1l4HSiFFTy7aVD26t0GA8CJhUKatkYroxAZ31maaOG/XzPTYc8NO69IPKHTq4qIsebHMVLTZWk6FoQFSgbzAIHyzsTMZ4+rzC1fYiNavot8Nwe5b8gKiRcCOYjn0ZqLLl6wO9q0DI6lByol+7Bsk9Pkuxig/xm3OtFdZn9BJok4+7/kAaZpgyZBMST11qMJynR4HGm6qStd0EgO3BkiBHqFHmDdRVQJx+iuHAi1DeTxkuS9aceaDbuukEuF9YglSKasSo/sFRmKrNXDbHJuxHmAbavDLkK9h9oNTXije/Sy7vBsWO2wC1vzDnRNjrV1suWa/1xICQDB9j+Wlw3JeoysRmwVLT3arYR+hWpqBR7l5GAoEOkKRIVhPXZw7JGRPih5xc7f9Jo/+ciaRfpfgj+/H900uXirF5qk3EteVJVD9C0DO3kgTfNSCZ+MqXRHBp1QAQz21kUPZb0a8ZvMJtYwuSKXBY+S3xgGCzu3RDlkBCH2mwf771xheB5QD1wIKNcAqru5HD18EG6+zM1Tu9IdTcWZx3nzCpsY+EPJnxpyDbVL8aIrjH24IsbFQW4q1bEppLUxZLONq8MTqvNrhghgdreTmM8oYNgq4ZxECimT8aLuLqtCZvaSObbbuDYvCPmoLKOC1rbF2RPfQ4FNwaQu52V2Q8zJRVH+WdxxyWPTnVSaXv/5VM6fOrmUu8GqOU/rPPRiinbcN/LCL4GCRyIiXDFIaoORphpRUXJSWQCvhQjzFMFvNKBjNRVcVaCEl8N0mAax5/L1qHh62UyubezEaxlO0qnKpShYOLIanCIR7swAWrWIQDcfNktZZ0rg8pC/gaBAtWQN0pE5jvvvX+iiieNS8CU3RH7/yKSm/F1Tc+Wy3eXSB4G1I0j/GkFEFfUbNBd0Y75wci85HBq7oEHqsbszfW4S+AsoaTileRFaLTARahydOiD2J3mEsO3OgvblYGODbGoFcj185/DZ0A6QBVk8Ah6GV+KTB31yRGS1lwto4TKtJB6A6Q3i0W2Mh4G6FPMa8bF70sOPg5qCsg4NHDvNOA5qhhTkhEb0FNDFd9xs56mrhJM4Xi+ek2gRQg0MoHTeUN+a2/FKG0NgS4LXhGYHgr1zbbJ7Bf027XaXyeJGzhEmfwD0IlwIk5syWr/wJWt3kwJG+0VJPMsV5/qy6ryla/QvXQi2cc1zIv3skmX6o4Klp6Hhmuq1v8RqYEPZzpZ8jERSO05otuJ2R/82zug3IOn9oY3xr29/bJB90YhirRu+0IWgjV/S8PbWJKeyOgH1+wN0LfUBcEGODmlUpvN7R/TNmoQtNkHrdOxVN+2CdP6qcirL91LtQl/csrdQXcvSrPmZ0CclyiMl/AreriBOT/doH0uCkH3SEfh9xwmb01l6EH44SOa3BRXFVaxXB1cIlUt9q9kB868p0ETkgYsduxfykQgLnpA59HUHEsQQKm0CCNEM3u/Mn2jt0HjsyXJf1VkCHC5yR6RAIude4AsfAeuYrWwzBqUqFOrYwgNOIl3NpoO4bQP5pDuaLwPY2RI9WdmoXmXQZ73QC32fgxpDV5ccnb9H8Xd7AKtqoTQS87kS56aISlAWCjL5mH+8dmIMIQIqcXxjEN6uSgEBq5ap2MNPxXA+ombnlTR4IwqArVoR3GrsArxTuSsilphcmRfpad9mL2eJMJt7eKDlJ6byA9Z9j1/SM22qO1j1M0m5AvrYzqrphbxO8D8MIIsKIL6o0i/ilIDuYfNW4ldoPiKljNK1wAk9tYVM//RVaxeWYC7Gd5JRqMgpYMtQBQvlgNW8DMUKVgolN7E9LwkjDn5LLtWudZX4bdf0R+BqzEudDQfuGAwKWcK6wffT4Y/nKbf2cjJBKdjM4ZtDL0wbKXsAHhqcBCquXexFjRTr5J5PevN2QQsJ0fvaYNdyUlxD7OY0CB2rolH9+XSfoD3ZxOss/mWZvk4oeSDJxfui9rooFZWqu5yM/FKG/JTuUgniLTcywwj/70kEX/pBanUUBIzqESbLo3TzCQy0c1o3hibwXLbToWV0o+BC3V5K/fN8LjCFoBIwkZbmUGPQEkccv8RP4yhW8I48GfDd3Wdh9x3TKc3Z52y1rXUzFI2fhafGCuEwwwg9weDKZlfKIWELbQ9YEPdQunHuo/Ab3qH/WisakOAtFdoOukwq7a3iVmxv6XHULJPhnqg9qOeYJMOes3djJ84mYedVYaU9qEHU8dv+HKBuTCEyBYgOfElSmIbmCLE/rr38r8si3/wh14cSY/+5CDWj/MW8/XYMz2iB6Zt01QGzHvgeW72oBd+uVzY+Vi++gvFnwRnFG/8vJJwIIZqeG+MUJ0QtScAoSk5Nte3OYfPn517aJefSwqAv3DT0KQj9OpFQrTY/wC3rt86tCbdtbl20FBNzJzdkj/ulaB6uk+sD67bukV1mJz9/HgP/Fsk+A+zwxkmUFzD7S1C7qr2Grexvyd4jpJQw+79eYBieiZIyRDizMeIVVmYpqA1HZ6IwtGdtsRNY6VunHgiqYk373iWIGe2q7f8ZCOIofRG559E3uHCKn2/mGN0thzh12lThuaXrqY2svYD2afKhWpZR1AoSP/Y3m49NYqCPpzynvrxCM48q872rU+1iK/zAXi37JGjBrC1Am3F/CGM+4qWnGDauqPLo6ZQOZCPHHgAOX6V8EAz4XTi1dpFmgTb3kJveL1T31K+qqmPin5O6orRfbvADvACo3RKJrHioWwZVmyrhCBWSJfhbzbgyPPiX8Dzoyc1qZm7VX+nIOgi1Yb59vMssD3/9PtUdjlntQPP27V/aXvz6x/JecoY2F9rxrSeVPxODtdwtkCwEPuscR+zZR2T41ek0kbmxc4UYpW1kpoYJfxOw3XWrfGZNG5lHmiP1VJ67/tb9OyQcXhcV5gbctX62xRpH/vF+Trx+pdwP7tysauATJ6sAtsIzj73buMht7GXAHALjcqGjNBkxp1nuawXtIPUIrKfq8buuxNDp2dsPUF3qRH2eozhLuRsppSK1vaH1FkDXRBhlYTaZMEMmxswQ5V6JE+xgE76l4xFSKsqjOmZDi98xQfTrcyRruHPSfI2+gNCyG/wLCV3uzQMJOPGkzh2XIJMhIFHJg1AcRFk5nGl2dfIAdPxyeqkuDR/jCpGmn3iegyRy8aDTYCWJnDPMvHbkR8XzrDa3XcWLh6IM4ovz48Vgb4upM4Y0TDEOUAHEEFvJd2iC/kqXZfxyUtXOF/EbzoqdFjK6W89hmjEiP1Svwjngbz48PPy+73TJKj6jiv7APiIzXPnKrmWLVy9FacbRYXuD3smXsyTrIeHgJwy+aEEO0jRXX2m0UDO9B0UlLQbkOeOs/3lyxKV5+mmcRSQvswvRvEJCkFq1ayp8clzmdxe/MNSHvt4o2JMRgfj1LLqev5iC9Xn/UXBPC3GPWG26sr5Jq/G0E9OP2szI9tmd5q26D3EHPrR8ogO9bs+1FMAhdI88lo9ucx/OjCj/wNyWC279RMkxSaW1bqY2jcWKNIhAwkzjwGMV58CeOwNQgwYX+piFcfPl2PNKDo55cGWn7a9o7ik+KYiQxOZsnF4ngAf/fVjhnKJ/Z7vAKlhv9Vi5WcmMwC5evQbC8lET7Z5i/T17PQFA0niwUahcABJujMPvu70CK1BVnpeOguQMDIQ5imCxUGCEGjb/Cl5tiS6B4GeCSL0rQ0KQM9b2BWBDXpTezgUEX+ue2lyz3Gvqdm/dQkFe58eMhXwDCkYpJs4fhfg811UPpYHclBZcn0QYJwHPU1GynmB0RskCoAiK4Y9CCyo/cP/JOHIWdHTe/UW+wdNI9tr62hcYAuDERJYVMMbiYLypNLlJNOAcdgKYdvAYjQWwVpzT+rGC7G5IPpuLDc5VWUy0gOjgvtuGvTXiETp8lsiLHj4DinLCNDGkvIKKLH8NujhADpDTedieOFzc9Ry1ATTjcYzXvqdrkTab3TTn/zZcdhKt5/2FlvphdLOnbg4MrpNEIzYOBvkXLkCG+oo2exNLqulXNsak01HcMSS5KQ0qAsQiBdjiiuiSCv+BC5DEbPCoVMWcnp+LmQShQbeDWKUAnd/9bAoa9V7aLQalWTIU68yaejhx9978YHIWelRDeWe4u0xGAB7z3K40Hy1qs84e1Oc/WOqzP+S3UxDIkPx9EQiQPcP7crqPgjkKFNfLoM8v1qUMCTKdDJScUqmU88U07o0WGw1h4GEnnXK7bdKvMf8Qa68jeoeq/Rj2/Jl8OUIqdgighNti1LtygaREq8mpIB//GZs4DyGhl1RpyDHfHpvLVTuBmLarTke8L7Sw12DJ6weXRravGLULQ8z28IK9qE4g3ETuOS3FhQ8PcRxr/S35YluvlZ/6SRljC3YzCVWZPlOnZmUe3WmzJZH6zHwtQGGUDaisQONodxGUjLLMOa5vabuuT/UDeLRC/tY8ZU3gXQmuqzK7PBtL28mRC9r/0Mlzdwu15C+gK8ztWgQa2hWEUqg5YlxI9Nv6ftOU3gQ9sTy3A9MSAqUhn2HucL4rduNH4Aye3apGrGfB3OMwOG/NgTg4DLGUfc6WICsKSagcC0EDN0NpTXW+bQarm9oUFwZPy5bzCqADzrqOQMiXtaBlLIaEICx+oRE0iWKi9jdfo9EPJ8MGjxasXh8bq4dxNBg/SQlZCCOKC6sOyBX724ZDAn2LSrHZeCcjA445YYyc13d4VucHohkuloDr+uHdi1hylkgGZD6HqvWHeRvWKaGpJKaZtnithU8jixpNM4Wje6GrwSezGkLPuDSePR+pII5QPLypZgnLJBbHSYr+it0/5Seld3zSWpftNhdSkObH5x0RSBTJ19K9ViRkQm0EQP8B1sDiJ1pNTTd6nC8L2C8gWkDCCxCaGUuEVXnXhSIDbMJl8rj0HVc5LuJ9iU0v7C/Wws5TLpSv0ikNNuxvRE7kXj+FxEv6LH/Y4x0x4LH3t69tDYqX3oHBHkp8EOdixcalv/KWhSsFUgomKMYQkMa30aZM7CndDYkJSfjGNlPQk0Op2HKfw6wmhW8RR1ewCD7EDxSf5uJnG97sSCGxnrgAA=",
      registrationId: "REG001",
      sexe: "FEMALE",
      breed: { name: "Labrador" },
    },
    {
      id: "2",
      name: "Max",
      birth: new Date("2019-07-22"),
      image:
        "data:image/webp;base64,UklGRtgJAABXRUJQVlA4IMwJAADwOgCdASriAJsAPolAm0olI6KhprWqaKARCWdu4XKQzpkcctSOACq1Wxexsuy8sduoWfj/FTT5NTEjLlsdy90bKOJ9nnWC1oGxwn8n2Rnlu8YltxrLPN5zwzIiPbK7nd22V0/SnnOcD2euNY0LzF5Lp4PhQho3c6mHixYQ6eh6ixBNXCdpTm5yHc12x6RwkkymAyXbgvW1G6DQElnWUW/qx7tqewGqxP4dWBPTn78P4ytmB1OG0yJMZTTdJLA2nJL3ebve8Xml0EuJSMqCM3EnHtGWrrRYz7v3qBreDtSZW7FFg5/K/4r0BpdCW7vEI9/BriZBnSLjnX+NGTO3qULK20YbW2//VWMJ6YqS4jOh27/6o+b4zJNuzoJt2k2d8th4KYcDmW8cMaIAv0t1oIEUBotUjeE7c55n+KOhmSIkXn+vfsqK5Xe3wuO1PWT120I1SOV5Jy40UNj1iNgs/giiCSNdIsOePnp03PqdQO1xEtEnOL6FHmOppujbFu7OumLrmo/FRrlbf+yehARxyQKgCzz/AEiW4HAoZsXF1xJOe3jJEDIZi3Fdot1Wj+DhU9od42GsVvKALQLDQwijJ30CkYhRixo40U4DAVrl2vrl5hNc08p0pTZSeKjtrMUICAAA/v3NY//+Fa+Vr5Wrxv/anizsepwUXrjV6f4Hr0DNdDTuBkfjyBHZx6QyTj5Wop9i6heAAAWRQISWhdiOtdPBErUigDYMRPk6xNmuET6DdSqq++ZC2EcNkW9oeN1P75eKjoqVDNiGHk7iRmOWcO5WNAVohj1oPKJ6kYVA7X8O6B9qJW25LpqqdrqEDXM4j/aphj71BXf7Jg2+JT5V3dfPCal/y3YJqTXOp6EPY8E2urgWaHFwsNoBJ4NoodolKu8vQcSB8q/0CyBqrtfFNCcBe1P9kHjLFZDDLcthu+RL2K49r20TuRE46+/mLtysgvSF4zY1MQEbOaHqJAvSDXQsVuwLw2L+sEa2Oq3eMOaquc4Qg6vn7yrwpaJK7cBF4Cf8q6XAfz/Bc4P2U0HdN05o+dP9SJqbE2SMyAXOKyk0CFYaTulpnw2QkqTMSNTXWldSmJ3P7+kryUP8WYAR9EwO62Aiz8tghNDiyQQtO391tfggeIIGeVUHH+OSSc0eKI66lViatJsBMhMcliqNwFd9K2PNymyGvNft0TT7DAmHiTVWVGGyl9texnCY33e0IUYXB2kb+vLdfACKlyJw+/wo5UaK3DlePgqipu/l6nN/UrhO6Ra/30xYEdFhJvHBCH5zHchRE4StKj6+T8GNgFft5WjfM2Kq1HML+CqcGE/GHXC2q1UeJFtePHBncoLPlNCi6S9Zh839vD9Rfe1vwHCMjNfb32N35BtIvU/gaUqaxZtqYeEe5zPJ6ZzFopT77O8iYlIFjtm4UamhHCQcoch9oVGH9wgmsUjmqDSzUMl1CTfrzPc1wvd6Y1sWquFJhxnCIxz8x5pi9OAOfk9mg9PShBN4mUVxRII/IQqJ6iT5dUeey7Ew5aL2oAE53ImVIRclbrdw3gqBnDTlJ4SB7RiWB5STgzq/qMZiXaPUa17xqtiK4IJjG4VLrcXBnC7ejuAniVUcpNia2gjJj+Zt3xaUAV4jLWsqzgEipwt60bRXLCr2+ABXeOGAyus87GvrFAQh1+Rkwg2jNtLK+hVMnvC+wQwyebLnqOlM3NV8crzB0BgavmJdE0LDxMClXCd+Dv3rnafhgRwpXepo25XATzMrCMU4ZVqDcINZsdXLZ8sPMB/uWUxoem2juw5JMKmcnYiSo7ggfmejJCnNarITHlKQLSRvlbVlob+wHxHoug1T5H6E046Q1C2ihjvB3ShfTXXTZc13vd4PG4F80HLBKFKlZroeRsCSpyVLjPMb923PwEnOiPlZ4cQMAfp6jzAfbjtyYZBf8D1/O75IWesSLQb/uCb+4lBuCh0goGay+saiA/EH9/RcLyvPXFhvcktRHSavX7RT2uMyZFODMHrOUrhI/gx49IRNsWAVaKOl6gFxiB+zjBE7tHoAolgffrtJIbslo1uWhAj5azgkE7oUdLxVpp6zmKaVx5SbwTFYvohqBbxCB3xZ+39ECx91WuZ4KaLHmdrp3lrci9rh02GWfjwyX0HivDFZ6hfOgWKpdxoe4U5g9705rmLgc0r8WGgjQHylJtbZietu3j8uhaXrqoVncqUE3r60Zv161Ma5GlBbm9bkYoMjjTCOGLvrpZltzm0eCZRkPzGGSZbdFwdeUNRguYKCR9ak+u5/8cf32pdKPP8mrx/JDW5JFxBX7keVkWlCEWBr6xdr079UMLuiq7U27fh6m+m7XNfcSKRQQ+BdGNC2H5tub7D15VjsJdnuoOBr+WxzSWn8cSdMuVZYynIEYFxsOwbZudCMI9SpQds8ee8u13KAbIA1s47AhhJuo5ItHaofgkfIFcxh5qWRia5PwyMQH0KsgXFsYhSP/dZynGPfRZPYr6iP0pP+Zpp9QTgzDvuth7WME2VCNkDjjGe+3n/X6t5C/v3MV6TQK4TGJ6g+u7ZZXz8DhCFA6ZUxup1Fv7PJMpQlNMuNyGIVvEMGbzfMjVDgeBPsCbVnCT8w8tNK945OcvP9krNY9jNzNWUnjokNteLguw+uVG+Wuh+Abn7qUjQQkjNS/BF+rJ9grm02dCpBh7XDGS/4YL096oBpqC+2dgisuLedNiEW+f+mtQ07wNmpU76xaZ6aV31SgcNmd9a35xWQnY4UFGWdmVPLIm0G7mN1VtkadRxGrQ+ExyCZFrzBH7ihEzLbV4LwzM3cMH085v4npG67eIBEbsY2xyYOqlLhMAi64L40GOhfgEd34fFJmQOju7S0VOi47ms/BeYHNYk1vl4F/nqZtUPE/7NyOm6ShHld2XcVCdoECbeXAvnlHzE+gKKVs1o6iKXT4SV/UcCs2NDV23lnwtYjrxb/OLi8L6fOKyruotrvJRc9BLwFnV3eYE7tNN18M0fP4SqI5C5ZBWLenCaEr436jv28Ma6dmj5nAkK6MZnF6jXvWePHYPl96wgEjv/CJF0vD2Aaiu14gtRbHf/n6P2Uv9HvKZYpjU5e2BEuhyK6LR7d4vbxJTVbwdlY/oIzJIazjHamQk0Jm9FciFFZHvPISUcWjKwKoGioPudiagn+C2t1XnAxwgmSQCf6QchB6Wt+cB7Cn9uWoKDGuH3vi2G+rMovLDZJowEOFkg7BJDOsOVIaaeElesHYq+axMKtaVWWdLKL+FknkqQFzoSa6A0CRPlWIcuTIh/7OpfAGCp8DZYWLJLjGw4nxZFY/RhDRxUyw6KS4gAAOnHsVxJrOrokJV+AojiCIAAAAAA=",
      registrationId: "REG002",
      sexe: "MALE",
      breed: { name: "Golden Retriever" },
    },
    {
      id: "3",
      name: "Mimi",
      birth: new Date("2021-11-08"),
      image:
        "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcSEw06A_EJl6DMu8Byi3oN7RxVrEH4L9k8vLEhDOkVwiyf6Cyt3x8C3ux3GljFe7hI4b7F1zypjezAsyKlkYF8BPEB6d9-JYvCfgHGIYnQ15A",
      registrationId: "REG003",
      sexe: "FEMALE",
      breed: { name: "Chat Persan" },
    },
    {
      id: "4",
      name: "Mimi",
      birth: new Date("2021-11-08"),
      image:
        "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcSEw06A_EJl6DMu8Byi3oN7RxVrEH4L9k8vLEhDOkVwiyf6Cyt3x8C3ux3GljFe7hI4b7F1zypjezAsyKlkYF8BPEB6d9-JYvCfgHGIYnQ15A",
      registrationId: "REG003",
      sexe: "FEMALE",
      breed: { name: "Chat Persan" },
    },
  ];

  const mockConsultations = [
    {
      id: "1",
      reservationDate: new Date("2024-01-15"),
      startDate: new Date("2024-01-20T10:00:00"),
      endDate: new Date("2024-01-20T10:30:00"),
      status: "COMPLETED",
      description: "Vaccination annuelle",
      pet: { name: "Luna" },
      organization: { name: "Clinique Vétérinaire du Centre" },
    },
    {
      id: "2",
      reservationDate: new Date("2024-02-01"),
      startDate: new Date("2024-02-10T14:00:00"),
      endDate: new Date("2024-02-10T14:45:00"),
      status: "CONFIRMED",
      description: "Contrôle de routine",
      pet: { name: "Max" },
      organization: { name: "Cabinet Dr. Martin" },
    },
    {
      id: "3",
      reservationDate: new Date("2024-02-20"),
      startDate: new Date("2024-02-25T16:30:00"),
      endDate: new Date("2024-02-25T17:00:00"),
      status: "PENDING",
      description: "Consultation dermatologique",
      pet: { name: "Mimi" },
      organization: { name: "Clinique Vétérinaire du Centre" },
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "Terminée";
      case "CONFIRMED":
        return "Confirmée";
      case "PENDING":
        return "En attente";
      case "CANCELLED":
        return "Annulée";
      default:
        return status;
    }
  };

  const calculateAge = (birthDate: Date) => {
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      return age - 1;
    }
    return age;
  };
  return (
    <div className="min-h-screen bg-white mt-16">
      <div className="container mx-auto p-4">
        <Tabs defaultValue="home" className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-8">
            <TabsTrigger value="home" className="flex items-center gap-2 ">
              <User className="w-4 h-4" />
              Page d'accueil
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Mon profil
            </TabsTrigger>
            <TabsTrigger
              value="appointments"
              className="flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Mes rendez-vous
            </TabsTrigger>
            <TabsTrigger
              value="practitioners"
              className="flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              Mes praticiens
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Avis
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Mes paiements
            </TabsTrigger>
          </TabsList>

          <TabsContent value="home" className="space-y-6">
            {/* Pets Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  Mes animaux ({mockPets.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {mockPets.map((pet) => (
                    <Card key={pet.id} className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage
                            src={pet.image || "/placeholder.svg"}
                            alt={pet.name}
                          />
                          <AvatarFallback>{pet.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-semibold">{pet.name}</h3>
                          <p className="text-sm text-gray-600">
                            {pet.breed.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {calculateAge(pet.birth)} ans •{" "}
                            {pet.sexe === "MALE" ? "Mâle" : "Femelle"}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Consultations Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  Mes consultations récentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockConsultations.map((consultation) => (
                    <Card key={consultation.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">
                              {consultation.description}
                            </h3>
                            <Badge
                              className={getStatusColor(consultation.status)}
                            >
                              {getStatusText(consultation.status)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            Animal: {consultation.pet.name}
                          </p>
                          <p className="text-sm text-gray-600 mb-1">
                            Clinique: {consultation.organization.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {consultation.startDate.toLocaleDateString("fr-FR")}{" "}
                            à{" "}
                            {consultation.startDate.toLocaleTimeString(
                              "fr-FR",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-4">
                <Settings className="w-16 h-16 text-gray-400" />
                <h2 className="text-xl font-semibold">Modifier mon profil</h2>
                <p className="text-gray-600">
                  Cette section est en cours de développement
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments">
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-4">
                <Calendar className="w-16 h-16 text-gray-400" />
                <h2 className="text-xl font-semibold">Gérer mes rendez-vous</h2>
                <p className="text-gray-600">
                  Cette section est en cours de développement
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="practitioners">
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-4">
                <User className="w-16 h-16 text-gray-400" />
                <h2 className="text-xl font-semibold">Mes praticiens</h2>
                <p className="text-gray-600">
                  Cette section est en cours de développement
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-4">
                <Star className="w-16 h-16 text-gray-400" />
                <h2 className="text-xl font-semibold">Mes avis</h2>
                <p className="text-gray-600">
                  Cette section est en cours de développement
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-4">
                <CreditCard className="w-16 h-16 text-gray-400" />
                <h2 className="text-xl font-semibold">Mes paiements</h2>
                <p className="text-gray-600">
                  Cette section est en cours de développement
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
