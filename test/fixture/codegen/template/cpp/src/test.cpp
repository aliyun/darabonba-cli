// This file is auto-generated, don't edit it. Thanks.

#include <darabonba/test.hpp>
#include <darabonba/core.hpp>
#include <iostream>
#include <map>

using namespace std;

using namespace Darabonba_Test;

map<string, string> Darabonba_Test::Client::helloMap() {
  shared_ptr<map<string, string>> m = make_shared<map<string, string>>(map<string, string>());
  return Darabonba::Converter::merge(map<string, string>({
    {"key", "value"},
    {"key-1", "value-1"}
  }), !m ? map<string, string>() : *m);
}

