// This file is auto-generated, don't edit it. Thanks.
package client

import (
  "github.com/alibabacloud-go/tea/tea"
)


func HelloMap () (_result map[string]*string) {
  m := make(map[string]*string)
  _result = make(map[string]*string)
  tea.Convert(tea.Merge(map[string]*string{
    "key": tea.String("value"),
    "key-1": tea.String("value-1"),
    },m), &_result)
  return _result
}

